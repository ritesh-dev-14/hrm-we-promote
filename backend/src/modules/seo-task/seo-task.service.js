const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const cloudinary = require("../../utils/cloudinary");

const isSeoDepartment = (department) =>
  department?.name?.toLowerCase().includes("seo");

const formatTask = (task) => ({
  id: task.id,
  projectId: task.projectId,
  managerId: task.managerId,
  taskName: task.taskName,
  workingOnTask: task.workingOnTask,
  keyword: task.keyword,
  screenshotUrl: task.screenshotUrl,
  screenshotPublicId: task.screenshotPublicId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  manager: task.manager
    ? {
        id: task.manager.id,
        name: task.manager.name,
        employeeId: task.manager.employeeId,
        role: task.manager.role,
      }
    : null,
  project: task.project
    ? {
        id: task.project.id,
        projectName: task.project.projectName,
        department: task.project.department || null,
      }
    : null,
});

const taskInclude = {
  manager: {
    select: { id: true, name: true, employeeId: true, role: true },
  },
  project: {
    select: {
      id: true,
      projectName: true,
      department: { select: { id: true, name: true } },
    },
  },
};

exports.createSeoTask = async (user, body, file) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Only managers can create SEO tasks.",
    });
  }

  if (!file) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Screenshot is required.",
    });
  }

  if (!body.projectId || !body.taskName || !body.workingOnTask || !body.keyword) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "projectId, taskName, workingOnTask, and keyword are required.",
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { department: true, assignments: true },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (!isSeoDepartment(project.department)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "SEO tasks can only be created for SEO department projects.",
    });
  }

  if (!project.assignments.some((assignment) => assignment.managerId === user.id)) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "You are not assigned to this project.",
    });
  }

  let screenshotUrl;
  let screenshotPublicId = null;
  try {
    const result = await cloudinary.uploadBuffer(file.buffer, {
      folder: "seo-tasks",
      resource_type: "image",
    });
    screenshotUrl = result.secure_url;
    screenshotPublicId = result.public_id;
  } catch (uploadErr) {
    throw new ApiError(500, {
      code: ERRORS.SERVER.INTERNAL_ERROR.code,
      message: `Screenshot upload failed: ${uploadErr.message}`,
    });
  }

  const task = await prisma.seoTask.create({
    data: {
      projectId: body.projectId,
      managerId: user.id,
      taskName: body.taskName.trim(),
      workingOnTask: body.workingOnTask.trim(),
      keyword: body.keyword.trim(),
      screenshotUrl,
      screenshotPublicId,
    },
    include: taskInclude,
  });

  return formatTask(task);
};

exports.getSeoTasks = async (user, projectId) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  if (!projectId) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "projectId is required.",
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { department: true, assignments: true },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (!isSeoDepartment(project.department)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "SEO tasks can only be viewed for SEO department projects.",
    });
  }

  if (
    user.role === "MANAGER" &&
    !project.assignments.some((assignment) => assignment.managerId === user.id)
  ) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const tasks = await prisma.seoTask.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });

  return tasks.map(formatTask);
};
