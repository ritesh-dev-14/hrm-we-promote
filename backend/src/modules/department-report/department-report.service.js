const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const VIEW_ROLES = ["ADMIN", "HR", "EA", "MANAGER"];
const DEPARTMENT_NAMES = {
  marketing: ["marketing", "marketing department"],
  seo: ["seo", "seo department"],
  "web-development": ["web development", "web development department", "it"],
};

const projectInclude = {
  select: {
    id: true,
    projectName: true,
    department: { select: { id: true, name: true } },
  },
};

const submitterSelect = {
  id: true,
  name: true,
  employeeId: true,
  role: true,
};

const getDateFilter = (from, to) => {
  if (!from && !to) return undefined;

  const date = {};
  if (from) {
    const fromDate = new Date(from);
    if (Number.isNaN(fromDate.getTime())) throw new ApiError(400, "Invalid from date.");
    date.gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (Number.isNaN(toDate.getTime())) throw new ApiError(400, "Invalid to date.");
    toDate.setHours(23, 59, 59, 999);
    date.lte = toDate;
  }
  return date;
};

const matchesDepartment = (names) => ({
  department: {
    name: { in: names, mode: "insensitive" },
  },
});

const normalize = (type, report, submitterField) => ({
  id: report.id,
  type,
  date: report.date || report.checkDate,
  createdAt: report.createdAt,
  submittedBy: report[submitterField],
  project: report.project,
  report: Object.fromEntries(
    Object.entries(report).filter(([key]) => !["project", "manager", "employee"].includes(key))
  ),
});

exports.getDepartmentReports = async (user, query = {}) => {
  if (!VIEW_ROLES.includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const requestedDepartment = query.department?.toLowerCase();
  const selectedDepartments = requestedDepartment
    ? [requestedDepartment]
    : Object.keys(DEPARTMENT_NAMES);

  if (selectedDepartments.some((department) => !DEPARTMENT_NAMES[department])) {
    throw new ApiError(400, "department must be marketing, seo, or web-development.");
  }

  const dateFilter = getDateFilter(query.from, query.to);
  const projectFilter = query.projectId ? { projectId: query.projectId } : {};
  const reports = [];

  if (selectedDepartments.includes("marketing")) {
    const marketingReports = await prisma.marketingReport.findMany({
      where: {
        ...projectFilter,
        ...(dateFilter ? { date: dateFilter } : {}),
        project: matchesDepartment(DEPARTMENT_NAMES.marketing),
      },
      orderBy: { date: "desc" },
      include: { project: projectInclude, manager: { select: submitterSelect } },
    });
    reports.push(...marketingReports.map((report) => normalize("marketing", report, "manager")));
  }

  if (selectedDepartments.includes("seo")) {
    const seoReports = await prisma.seoReport.findMany({
      where: {
        ...projectFilter,
        ...(dateFilter ? { checkDate: dateFilter } : {}),
        project: matchesDepartment(DEPARTMENT_NAMES.seo),
      },
      orderBy: { checkDate: "desc" },
      include: { project: projectInclude, manager: { select: submitterSelect } },
    });
    reports.push(...seoReports.map((report) => normalize("seo", report, "manager")));
  }

  if (selectedDepartments.includes("web-development")) {
    const webDevelopmentReports = await prisma.projectDailyReport.findMany({
      where: {
        ...projectFilter,
        ...(dateFilter ? { date: dateFilter } : {}),
        project: matchesDepartment(DEPARTMENT_NAMES["web-development"]),
      },
      orderBy: { date: "desc" },
      include: { project: projectInclude, employee: { select: submitterSelect } },
    });
    reports.push(...webDevelopmentReports.map((report) => normalize("web-development", report, "employee")));
  }

  reports.sort((left, right) => new Date(right.date) - new Date(left.date));

  return {
    reports,
    counts: reports.reduce((result, report) => {
      result[report.type] = (result[report.type] || 0) + 1;
      return result;
    }, {}),
  };
};