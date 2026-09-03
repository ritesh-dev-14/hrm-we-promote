const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const allowedRoles = ["ADMIN", "HR", "EA", "MANAGER"];
const assignmentRoles = ["ADMIN", "HR", "MANAGER"];

const formatUser = (user) =>
  user
    ? {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
      }
    : null;

const formatTask = (task) => {
  const projectName = task.projectName || task.clientName || null;

  return {
    id: task.id,
    projectName,
    clientName: task.clientName || projectName || null,
    monthlyBudget: task.monthlyBudget,
    objective: task.objective,
    area: task.area,
    fundsAddedBy: task.fundsAddedBy,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    createdBy: formatUser(task.createdBy),
    assignedTo: formatUser(task.assignedTo),
  };
};

const parseObjective = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (!["LEAD", "AWARENESS", "BOTH"].includes(normalized)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "objective must be either LEAD, AWARENESS, or BOTH.",
    });
  }
  return normalized;
};

const parseFundsAddedBy = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  const aliases = {
    CLIENT: "CLIENT",
    HARSH: "HARSH",
    HARSH_SIR: "HARSH",
  };

  const mapped = aliases[normalized] || normalized;
  if (!["CLIENT", "HARSH"].includes(mapped)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "fundsAddedBy must be either CLIENT or HARSH.",
    });
  }
  return mapped;
};

const resolveProjectName = (body) => {
  const projectName = body.projectName ?? body.clientName;

  if (projectName === undefined || !String(projectName).trim()) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "projectName is required.",
    });
  }

  return String(projectName).trim();
};

const validateAssignedManager = async (assignedToId, user) => {
  if (!assignedToId) return null;

  const assignedTo = await prisma.user.findUnique({
    where: { id: assignedToId },
  });

  if (!assignedTo) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Assigned manager not found.",
    });
  }

  if (user.role === "MANAGER" && assignedTo.id !== user.id) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Manager can assign this task only to themselves.",
    });
  }

  if (user.role === "HR" && assignedTo.role !== "MANAGER" && assignedTo.id !== user.id) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "HR can assign Meta Ads tasks only to a manager or themselves.",
    });
  }

  return assignedTo;
};

const validateNumber = (value, fieldName) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: `${fieldName} must be a positive number.`,
    });
  }
  return numeric;
};

const ensureAccess = (user, roles) => {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
};

const taskInclude = {
  createdBy: {
    select: { id: true, employeeId: true, name: true, role: true },
  },
  assignedTo: {
    select: { id: true, employeeId: true, name: true, role: true },
  },
};

exports.createMetaAdsTask = async (user, body) => {
  ensureAccess(user, allowedRoles);

  const projectName = resolveProjectName(body);

  if (!body.area || !String(body.area).trim()) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "area is required.",
    });
  }

  const assignedTo = await validateAssignedManager(body.assignedToId, user);
  const status = assignedTo ? "ASSIGNED" : "DRAFT";

  const task = await prisma.metaAdsTask.create({
    data: {
      projectName,
      clientName: projectName,
      monthlyBudget: validateNumber(body.monthlyBudget, "monthlyBudget"),
      objective: parseObjective(body.objective),
      area: String(body.area).trim(),
      fundsAddedBy: parseFundsAddedBy(body.fundsAddedBy),
      status,
      createdById: user.id,
      assignedToId: assignedTo ? assignedTo.id : null,
    },
    include: taskInclude,
  });

  return formatTask(task);
};

exports.getMetaAdsTasks = async (user) => {
  ensureAccess(user, allowedRoles);

  const where = user.role === "MANAGER"
    ? {
        OR: [
          { createdById: user.id },
          { assignedToId: user.id },
        ],
      }
    : {};

  const tasks = await prisma.metaAdsTask.findMany({
    where,
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });

  return tasks.map(formatTask);
};

exports.getMetaAdsTaskById = async (user, taskId) => {
  ensureAccess(user, allowedRoles);

  const task = await prisma.metaAdsTask.findUnique({
    where: { id: taskId },
    include: taskInclude,
  });

  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Meta Ads task not found.",
    });
  }

  if (
    user.role === "MANAGER" &&
    task.createdById !== user.id &&
    task.assignedToId !== user.id
  ) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return formatTask(task);
};

exports.assignMetaAdsTask = async (user, taskId, body) => {
  ensureAccess(user, assignmentRoles);

  const task = await prisma.metaAdsTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Meta Ads task not found.",
    });
  }

  const assignedTo = await validateAssignedManager(body.assignedToId, user);

  const updatedTask = await prisma.metaAdsTask.update({
    where: { id: taskId },
    data: {
      assignedToId: assignedTo.id,
      status: "ASSIGNED",
    },
    include: taskInclude,
  });

  return {
    success: true,
    message: "Meta Ads task assigned successfully.",
    data: formatTask(updatedTask),
  };
};

exports.updateMetaAdsTask = async (user, taskId, body) => {
  ensureAccess(user, allowedRoles);

  const task = await prisma.metaAdsTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Meta Ads task not found.",
    });
  }

  if (user.role === "MANAGER" && task.createdById !== user.id && task.assignedToId !== user.id) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const updateData = {};

  if (body.projectName !== undefined) {
    updateData.projectName = String(body.projectName).trim();
    updateData.clientName = String(body.projectName).trim();
  }
  if (body.clientName !== undefined) {
    updateData.clientName = String(body.clientName).trim();
    if (body.projectName === undefined) updateData.projectName = String(body.clientName).trim();
  }
  if (body.monthlyBudget !== undefined) updateData.monthlyBudget = validateNumber(body.monthlyBudget, "monthlyBudget");
  if (body.objective !== undefined) updateData.objective = parseObjective(body.objective);
  if (body.area !== undefined) updateData.area = String(body.area).trim();
  if (body.fundsAddedBy !== undefined) updateData.fundsAddedBy = parseFundsAddedBy(body.fundsAddedBy);
  if (body.assignedToId !== undefined) {
    const assignedTo = await validateAssignedManager(body.assignedToId, user);
    updateData.assignedToId = assignedTo ? assignedTo.id : null;
    updateData.status = assignedTo ? "ASSIGNED" : task.status;
  }
  if (body.status !== undefined) updateData.status = String(body.status).trim().toUpperCase();

  const updatedTask = await prisma.metaAdsTask.update({
    where: { id: taskId },
    data: updateData,
    include: taskInclude,
  });

  return formatTask(updatedTask);
};
