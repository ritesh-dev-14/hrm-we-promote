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

const formatTask = (task) => ({
  id: task.id,
  clientName: task.clientName,
  monthlyBudget: task.monthlyBudget,
  objective: task.objective,
  area: task.area,
  fundsAddedBy: task.fundsAddedBy,
  status: task.status,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  createdBy: formatUser(task.createdBy),
  assignedTo: formatUser(task.assignedTo),
});

const parseObjective = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (!["LEAD", "AWARENESS"].includes(normalized)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "objective must be either LEAD or AWARENESS.",
    });
  }
  return normalized;
};

const parseFundsAddedBy = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (!["CLIENT", "HARSH_SIR"].includes(normalized)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "fundsAddedBy must be either CLIENT or HARSH_SIR.",
    });
  }
  return normalized;
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

  if (!body.clientName || !String(body.clientName).trim()) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "clientName is required.",
    });
  }

  if (!body.area || !String(body.area).trim()) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "area is required.",
    });
  }

  const task = await prisma.metaAdsTask.create({
    data: {
      clientName: String(body.clientName).trim(),
      monthlyBudget: validateNumber(body.monthlyBudget, "monthlyBudget"),
      objective: parseObjective(body.objective),
      area: String(body.area).trim(),
      fundsAddedBy: parseFundsAddedBy(body.fundsAddedBy),
      status: "DRAFT",
      createdById: user.id,
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

  const assignedTo = await prisma.user.findUnique({
    where: { id: body.assignedToId },
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

  if (body.clientName !== undefined) updateData.clientName = String(body.clientName).trim();
  if (body.monthlyBudget !== undefined) updateData.monthlyBudget = validateNumber(body.monthlyBudget, "monthlyBudget");
  if (body.objective !== undefined) updateData.objective = parseObjective(body.objective);
  if (body.area !== undefined) updateData.area = String(body.area).trim();
  if (body.fundsAddedBy !== undefined) updateData.fundsAddedBy = parseFundsAddedBy(body.fundsAddedBy);
  if (body.status !== undefined) updateData.status = String(body.status).trim().toUpperCase();

  const updatedTask = await prisma.metaAdsTask.update({
    where: { id: taskId },
    data: updateData,
    include: taskInclude,
  });

  return formatTask(updatedTask);
};
