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