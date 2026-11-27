const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const IST_OFFSET_MS = 330 * 60 * 1000;
const getDateKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const shiftDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

const getIstDayStart = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MS);
};

const isValidDateKey = (dateKey) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || "")) return false;
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === dateKey;
};

const getPeriodRange = (period, selectedDate) => {
  if (!["daily", "weekly", "monthly"].includes(period)) {
    throw new ApiError(400, "period must be daily, weekly, or monthly.");
  }
  if (!isValidDateKey(selectedDate)) {
    throw new ApiError(400, "A valid date is required.");
  }
  const today = getDateKey(new Date());
  if (selectedDate > today) {
    throw new ApiError(400, "The selected date cannot be in the future.");
  }

  let fromDate = selectedDate;
  let periodEndDate = selectedDate;
  if (period === "weekly") {
    const weekday = new Date(`${selectedDate}T00:00:00.000Z`).getUTCDay();
    fromDate = shiftDateKey(selectedDate, weekday === 0 ? -6 : 1 - weekday);
    periodEndDate = shiftDateKey(fromDate, 6);
  } else if (period === "monthly") {
    fromDate = `${selectedDate.slice(0, 7)}-01`;
    const [year, month] = selectedDate.slice(0, 7).split("-").map(Number);
    periodEndDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  }

  const toDate = periodEndDate > today ? today : periodEndDate;
  const dates = [];
  for (let date = fromDate; date <= toDate; date = shiftDateKey(date, 1)) {
    dates.push(date);
  }
  return {
    period,
    fromDate,
    toDate,
    from: getIstDayStart(fromDate),
    to: getIstDayStart(shiftDateKey(toDate, 1)),
    dates,
  };
};

const getScoreReport = async (user, query) => {
  const roles = user.roles?.length ? user.roles : [user.role];
  if (!["ADMIN", "HR", "COORDINATOR"].some((role) => roles.includes(role))) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const period = query.period || "daily";
  const selectedDate = query.date || getDateKey(new Date());
  const range = getPeriodRange(period, selectedDate);

  const [assignments, marketingReports, seoReports, seoUnableSubmissions, coordinatorAssignments] = await Promise.all([
    prisma.projectAssignment.findMany({
      where: {
        assignedAt: { lt: range.to },
        project: {
          status: { not: "PAUSED" },
          startDate: { lt: range.to },
          endDate: { gte: range.from },
        },
      },
      include: {
        manager: { select: { id: true, name: true, employeeId: true, role: true } },
        project: {
          include: {
            department: { select: { name: true } },
            campaigns: { select: { id: true, name: true, createdAt: true } },
          },
        },
      },
    }),
    prisma.marketingReport.findMany({
      where: { date: { gte: range.from, lt: range.to }, campaignId: { not: null } },
      select: {
        id: true,
        projectId: true,
        campaignId: true,
        managerId: true,
        date: true,
        unableToSubmitReason: true,
        unableToSubmitScreenshotUrl: true,
      },
    }),
    prisma.seoReport.findMany({
      where: { checkDate: { gte: range.from, lt: range.to } },
      select: { id: true, projectId: true, managerId: true, checkDate: true },
    }),
    prisma.seoUnableSubmission.findMany({
      where: {
        reportDate: {
          gte: new Date(`${range.fromDate}T00:00:00.000Z`),
          lt: new Date(`${shiftDateKey(range.toDate, 1)}T00:00:00.000Z`),
        },
      },
      select: {
        id: true,
        projectId: true,
        managerId: true,
        reportDate: true,
        reason: true,
        screenshotUrl: true,
      },
    }),
    prisma.coordinatorAssignment.findMany({
      where: {
        completionDate: { gte: range.from, lt: range.to },
        assignedTo: { is: { role: "MANAGER" } },
      },
      select: {
        id: true,
        assignedToId: true,
        assignedBy: true,
        completionDate: true,
        status: true,
        reason: true,
        assignedTo: { select: { id: true, name: true, employeeId: true } },
        task: { select: { projectName: true } },
      },
    }),
  ]);

  const completions = new Map();
  const addCompletion = (key, completion) => {
    const current = completions.get(key);
    if (!current || (current.type === "UNABLE_TO_SUBMIT" && completion.type === "REPORT")) {
      completions.set(key, completion);
    }
  };
  marketingReports.forEach((report) => {
    if (report.unableToSubmitReason && !report.unableToSubmitScreenshotUrl) return;
    addCompletion(
      `${report.managerId}|META_ADS|${report.campaignId}|${getDateKey(report.date)}`,
      {
        type: report.unableToSubmitReason ? "UNABLE_TO_SUBMIT" : "REPORT",
        reason: report.unableToSubmitReason,
        screenshotUrl: report.unableToSubmitScreenshotUrl,
      },
    );
  });
  seoReports.forEach((report) => {
    addCompletion(
      `${report.managerId}|SEO|${report.projectId}|${getDateKey(report.checkDate)}`,
      { type: "REPORT", reason: null, screenshotUrl: null },
    );
  });
  seoUnableSubmissions.forEach((submission) => {
    addCompletion(
      `${submission.managerId}|SEO|${submission.projectId}|${getDateKey(submission.reportDate)}`,
      {
        type: "UNABLE_TO_SUBMIT",
        reason: submission.reason,
        screenshotUrl: submission.screenshotUrl,
      },
    );
  });

  const managers = new Map();
  const getManagerResult = (manager) => {
    let result = managers.get(manager.id);
    if (!result) {
      result = {
        managerId: manager.id,
        name: manager.name,
        employeeId: manager.employeeId,
        expectedCount: 0,
        completedCount: 0,
        seoExpectedCount: 0,
        seoCompletedCount: 0,
        metaAdsExpectedCount: 0,
        metaAdsCompletedCount: 0,
        coordinatorExpectedCount: 0,
        coordinatorCompletedCount: 0,
        tasks: [],
      };
      managers.set(manager.id, result);
    }
    return result;
  };
  const addTask = (assignment, category, itemId, itemName, date) => {
    const { manager, project } = assignment;
    const categoryKey = category === "SEO" ? "SEO" : "META_ADS";
    const itemKey = categoryKey === "SEO" ? project.id : itemId;
    const key = `${manager.id}|${categoryKey}|${itemKey}|${date}`;
    const completion = completions.get(key);
    const result = getManagerResult(manager);
    result.expectedCount += 1;
    if (categoryKey === "SEO") result.seoExpectedCount += 1;
    else result.metaAdsExpectedCount += 1;
    if (completion) {
      result.completedCount += 1;
      if (categoryKey === "SEO") result.seoCompletedCount += 1;
      else result.metaAdsCompletedCount += 1;
    }
    result.tasks.push({
      date,
      category: categoryKey,
      projectName: project.projectName,
      itemName,
      completed: Boolean(completion),
      completionType: completion?.type || null,
      reason: completion?.reason || null,
      screenshotUrl: completion?.screenshotUrl || null,
    });
  };

  assignments.forEach((assignment) => {
    const { project } = assignment;
    const departmentName = project.department?.name?.toLowerCase() || "";
    const category = departmentName.includes("seo")
      ? "SEO"
      : departmentName.includes("marketing") || departmentName.includes("meta") || departmentName.includes("ads")
        ? "META_ADS"
        : null;
    if (!category || project.status === "PAUSED") return;

    const assignmentDate = getDateKey(assignment.assignedAt);
    const projectStart = getDateKey(project.startDate);
    const projectEnd = getDateKey(project.endDate);
    range.dates.forEach((date) => {
      if (date < assignmentDate || date < projectStart || date > projectEnd) return;
      if (category === "SEO") {
        addTask(assignment, category, project.id, project.projectName, date);
        return;
      }
      project.campaigns.forEach((campaign) => {
        if (getDateKey(campaign.createdAt) <= date) {
          addTask(assignment, category, campaign.id, campaign.name, date);
        }
      });
    });
  });

  coordinatorAssignments.forEach((assignment) => {
    const manager = assignment.assignedTo;
    const date = getDateKey(assignment.completionDate);
    const reasonSubmitted =
      assignment.status === "UNABLE_TO_SUBMIT" && Boolean(assignment.reason?.trim());
    const completed = assignment.status === "COMPLETED" || assignment.status === "VERIFIED" || reasonSubmitted;
    const result = getManagerResult(manager);
    result.expectedCount += 1;
    result.coordinatorExpectedCount += 1;
    if (completed) {
      result.completedCount += 1;
      result.coordinatorCompletedCount += 1;
    }
    result.tasks.push({
      date,
      category: "COORDINATOR",
      projectName: assignment.task.projectName,
      itemName: assignment.task.projectName,
      assignedBy: assignment.assignedBy,
      status: assignment.status,
      completed,
      completionType: reasonSubmitted ? "UNABLE_TO_SUBMIT" : completed ? "COMPLETED" : null,
      reason: assignment.reason,
      screenshotUrl: null,
    });
  });

  const managerRows = Array.from(managers.values())
    .map((manager) => ({
      ...manager,
      score: manager.expectedCount
        ? Math.round((manager.completedCount / manager.expectedCount) * 100)
        : null,
      seoScore: manager.seoExpectedCount
        ? Math.round((manager.seoCompletedCount / manager.seoExpectedCount) * 100)
        : null,
      metaAdsScore: manager.metaAdsExpectedCount
        ? Math.round((manager.metaAdsCompletedCount / manager.metaAdsExpectedCount) * 100)
        : null,
      coordinatorScore: manager.coordinatorExpectedCount
        ? Math.round((manager.coordinatorCompletedCount / manager.coordinatorExpectedCount) * 100)
        : null,
      tasks: manager.tasks.sort((a, b) => a.date.localeCompare(b.date) || a.category.localeCompare(b.category)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    period,
    fromDate: range.fromDate,
    toDate: range.toDate,
    selectedDate,
    managers: managerRows,
  };
};

exports.getScoreReport = getScoreReport;
exports.getPeriodRange = getPeriodRange;
