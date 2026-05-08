const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

// 🔹 GET ASSIGNED TASKS
exports.getTasks = async (user) => {
  return prisma.taskAssignment.findMany({
    where: {
      userId: user.id,
    },
    include: {
      task: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// 🔹 SUBMIT TASK
exports.submitTask = async (user, assignmentId, body) => {
  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: assignmentId },
    include: { task: true }
  });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (assignment.userId !== user.id) {
    throw new ApiError(403, "Not your task");
  }

  if (assignment.status === "SUBMITTED") {
    throw new ApiError(400, "Task already submitted");
  }

  if (body.completedCount + body.pendingCount <= 0) {
    throw new ApiError(400, "Invalid task counts");
  }

  const submission = await prisma.taskSubmission.create({
    data: {
      assignmentId,
      completedCount: body.completedCount,
      pendingCount: body.pendingCount,
      driveLink: body.driveLink
    }
  });

  await prisma.taskAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "SUBMITTED"
    }
  });

  return submission;
};


// 🔹 APPLY LEAVE
exports.applyLeave = async (user, body) => {
  const { startDate, endDate, reason } = body;

  // ❗ validate dates
  if (new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  // ❗ prevent overlapping leaves
  const overlap = await prisma.leave.findFirst({
    where: {
      userId: user.id,
      OR: [
        {
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) },
        },
      ],
    },
  });

  if (overlap) {
    throw new ApiError(400, "Leave already applied for these dates");
  }

  return prisma.leave.create({
    data: {
      userId: user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });
};

// 🔹 GET MY LEAVES
exports.getMyLeaves = async (user) => {
  return prisma.leave.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
};