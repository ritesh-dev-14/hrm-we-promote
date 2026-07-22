const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const FREQUENCY_DEPARTMENTS = [
  "SEO",
  "Social Media",
  "Social Media Department",
];

const formatDay = (day) => ({
  id: day.id,
  date: day.date,
  reelType: day.reelType,
  postType: day.postType,
  videoType: day.videoType,
  title: day.title,
  referenceLinks: day.referenceLinks,
  submissionLinks: day.submissionLinks,
  script: day.script,
  description: day.description,
  createdAt: day.createdAt,
});

const formatSheet = (sheet) => ({
  id: sheet.id,
  projectId: sheet.projectId,
  month: sheet.month,
  year: sheet.year,
  totalReels: sheet.totalReels,
  totalPosts: sheet.totalPosts,
  totalReelsUploaded: sheet.totalReelsUploaded,
  totalPostsUploaded: sheet.totalPostsUploaded,
  moodBoardLink: sheet.moodBoardLink,
  createdBy: {
    id: sheet.createdBy.id,
    employeeId: sheet.createdBy.employeeId,
    name: sheet.createdBy.name,
    role: sheet.createdBy.role,
  },
  days: sheet.days.map(formatDay),
  createdAt: sheet.createdAt,
  updatedAt: sheet.updatedAt,
});

const verifyProjectAccess = async (user, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignments: true,
      department: true,
    },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (!FREQUENCY_DEPARTMENTS.includes(project.department.name)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Monthly sheets are only supported for SEO and Social Media projects.",
    });
  }

  const assignedManager = project.assignments.find(
    (assignment) => assignment.managerId === user.id
  );

  return { project, assignedManager };
};

exports.createProjectMonthlySheet = async (user, projectId, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const { project, assignedManager } = await verifyProjectAccess(user, projectId);

  if (!assignedManager) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existingSheet = await prisma.projectMonthlySheet.findFirst({
    where: {
      projectId,
      month: body.month,
      year: body.year,
    },
  });

  if (existingSheet) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A monthly sheet for this project and month already exists.",
    });
  }

  const sheet = await prisma.projectMonthlySheet.create({
    data: {
      projectId,
      month: body.month,
      year: body.year,
      totalReels: body.totalReels,
      totalPosts: body.totalPosts,
      totalReelsUploaded: body.totalReelsUploaded,
      totalPostsUploaded: body.totalPostsUploaded,
      moodBoardLink: body.moodBoardLink,
      createdById: user.id,
      days: {
        create: body.days.map((day) => ({
          date: new Date(day.date),
          reelType: day.reelType || null,
          postType: day.postType || null,
          videoType: day.videoType || null,
          title: day.title || null,
          referenceLinks: day.referenceLinks || [],
          script: day.script || null,
          description: day.description || null,
        })),
      },
    },
    include: {
      createdBy: true,
      days: true,
    },
  });

  return formatSheet(sheet);
};

exports.getProjectMonthlySheets = async (user, projectId) => {
  const { project, assignedManager } = await verifyProjectAccess(user, projectId);

  if (user.role === "MANAGER" && !assignedManager) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const sheets = await prisma.projectMonthlySheet.findMany({
    where: { projectId },
    include: {
      createdBy: true,
      days: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return sheets.map(formatSheet);
};

exports.getProjectMonthlySheetById = async (user, projectId, sheetId) => {
  const { project, assignedManager } = await verifyProjectAccess(user, projectId);

  if (user.role === "MANAGER" && !assignedManager) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const sheet = await prisma.projectMonthlySheet.findFirst({
    where: {
      id: sheetId,
      projectId,
    },
    include: {
      createdBy: true,
      days: true,
    },
  });

  if (!sheet) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Monthly sheet not found.",
    });
  }

  return formatSheet(sheet);
};

exports.updateProjectMonthlySheet = async (user, projectId, sheetId, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const { project, assignedManager } = await verifyProjectAccess(user, projectId);

  if (!assignedManager) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const sheet = await prisma.projectMonthlySheet.findFirst({
    where: { id: sheetId, projectId },
    include: { days: true },
  });

  if (!sheet) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Monthly sheet not found.",
    });
  }

  const data = {};
  if (body.totalReels !== undefined) data.totalReels = body.totalReels;
  if (body.totalPosts !== undefined) data.totalPosts = body.totalPosts;
  if (body.totalReelsUploaded !== undefined) data.totalReelsUploaded = body.totalReelsUploaded;
  if (body.totalPostsUploaded !== undefined) data.totalPostsUploaded = body.totalPostsUploaded;
  if (body.moodBoardLink !== undefined) data.moodBoardLink = body.moodBoardLink;

  const updateData = {
    data,
    where: { id: sheetId },
    include: {
      createdBy: true,
      days: true,
    },
  };

  if (body.days && Array.isArray(body.days)) {
    const existingDays = sheet.days || [];
    const existingDaysByDateMap = new Map();
    const existingDaysByIdMap = new Map();

    existingDays.forEach((d) => {
      const dateKey = new Date(d.date).toISOString().split("T")[0];
      existingDaysByDateMap.set(dateKey, d);
      existingDaysByIdMap.set(d.id, d);
    });

    for (const dayInput of body.days) {
      const inputDate = new Date(dayInput.date);
      const dateKey = inputDate.toISOString().split("T")[0];

      const existingDay = (dayInput.id && existingDaysByIdMap.get(dayInput.id)) ||
                          existingDaysByDateMap.get(dateKey);

      // Preserve submission links from shoot subtask approvals / existing day data
      let submissionLinksToKeep = existingDay ? (existingDay.submissionLinks || []) : [];
      if (Array.isArray(dayInput.submissionLinks) && dayInput.submissionLinks.length > 0) {
        submissionLinksToKeep = Array.from(
          new Set([...submissionLinksToKeep, ...dayInput.submissionLinks])
        );
      }

      if (existingDay) {
        // Update existing day record IN-PLACE so day ID and shootSubTask relations are preserved!
        await prisma.projectMonthlySheetDay.update({
          where: { id: existingDay.id },
          data: {
            date: inputDate,
            reelType: dayInput.reelType !== undefined ? (dayInput.reelType || null) : existingDay.reelType,
            postType: dayInput.postType !== undefined ? (dayInput.postType || null) : existingDay.postType,
            videoType: dayInput.videoType !== undefined ? (dayInput.videoType || null) : existingDay.videoType,
            title: dayInput.title !== undefined ? (dayInput.title || null) : existingDay.title,
            referenceLinks: dayInput.referenceLinks !== undefined ? (dayInput.referenceLinks || []) : existingDay.referenceLinks,
            script: dayInput.script !== undefined ? (dayInput.script || null) : existingDay.script,
            description: dayInput.description !== undefined ? (dayInput.description || null) : existingDay.description,
            submissionLinks: submissionLinksToKeep,
          },
        });
      } else {
        // Create new day record if it didn't exist before
        await prisma.projectMonthlySheetDay.create({
          data: {
            sheetId,
            date: inputDate,
            reelType: dayInput.reelType || null,
            postType: dayInput.postType || null,
            videoType: dayInput.videoType || null,
            title: dayInput.title || null,
            referenceLinks: dayInput.referenceLinks || [],
            submissionLinks: submissionLinksToKeep,
            script: dayInput.script || null,
            description: dayInput.description || null,
          },
        });
      }
    }
  }

  const updatedSheet = await prisma.projectMonthlySheet.update({
    where: { id: sheetId },
    data,
    include: {
      createdBy: true,
      days: true,
    },
  });

  return formatSheet(updatedSheet);
};
