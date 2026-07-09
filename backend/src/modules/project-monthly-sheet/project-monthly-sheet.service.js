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

  if (body.days) {
    await prisma.projectMonthlySheetDay.deleteMany({
      where: { sheetId },
    });

    updateData.data.days = {
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
    };
  }

  const updatedSheet = await prisma.projectMonthlySheet.update(updateData);

  return formatSheet(updatedSheet);
};
