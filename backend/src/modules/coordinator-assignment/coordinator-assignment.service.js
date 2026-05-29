const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE COORDINATOR ASSIGNMENT (With Inline Task Creation)
//
// Coordinator can create and assign a task in ONE call
// These are separate urgent tasks managed only by coordinator
// Fields:
// - task: String (required) - Task name/title
// - assignedToId: String (required) - User ID of the person receiving the task
// - assignedBy: String (required) - Text field, coordinator's name (e.g., "harsh", "nishay")
// - completionDate: DateTime (required) - Deadline for completion
// - employeeNumber: String (required) - Employee ID/number of the assigned-to person
// - employeeEmail: String (required) - Email of the assigned-to person
//
exports.createAssignment = async (user, body) => {
  //
  // ✅ ONLY COORDINATOR CAN CREATE ASSIGNMENTS
  //
  if (user.role !== "COORDINATOR") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  //
  // ✅ FIND USER TO ASSIGN TO
  //
  const assignedToUser = await prisma.user.findUnique({
    where: { id: body.assignedToId },
  });

  if (!assignedToUser) {
    throw new ApiError(400, "User not found");
  }

  //
  // ✅ VALIDATE ASSIGNED_TO USER DETAILS MATCH
  //
  if (
    assignedToUser.employeeId !== body.employeeNumber ||
    assignedToUser.email !== body.employeeEmail
  ) {
    throw new ApiError(
      400,
      "Employee details do not match"
    );
  }

  //
  // ✅ CREATE NEW TASK (as coordinator's urgent task)
  //
  const task = await prisma.task.create({
    data: {
      projectName: body.task, // Use task name as project name
      description: body.task, // Use task name as description
      startDate: new Date(),
      endDate: new Date(body.completionDate),
      createdById: user.id,
      status: "DRAFT",
    },
  });

  //
  // ✅ CHECK FOR DUPLICATE ASSIGNMENT (same task, same user)
  //
  const existingAssignment =
    await prisma.coordinatorAssignment.findUnique({
      where: {
        taskId_assignedToId: {
          taskId: task.id,
          assignedToId: body.assignedToId,
        },
      },
    });

  if (existingAssignment) {
    throw new ApiError(
      400,
      "This task is already assigned to this user"
    );
  }

  //
  // ✅ CREATE ASSIGNMENT
  //
  const assignment =
    await prisma.coordinatorAssignment.create({
      data: {
        taskId: task.id,
        assignedToId: body.assignedToId,
        createdById: user.id,
        assignedBy: body.assignedBy,
        completionDate: new Date(body.completionDate),
        employeeNumber: body.employeeNumber,
        employeeEmail: body.employeeEmail,
        status: "ASSIGNED",
      },
      include: {
        task: true,
        assignedTo: true,
        createdBy: true,
      },
    });

  //
  // ✅ SEND NOTIFICATION TO ASSIGNED USER
  //
  await prisma.notification.create({
    data: {
      userId: body.assignedToId,
      title: "New Urgent Task from Coordinator",
      message: `Urgent Task "${task.projectName}" assigned to you by ${body.assignedBy}. Due date: ${new Date(body.completionDate).toLocaleDateString()}`,
      type: "TASK_ASSIGNED",
      level: "INFO",
      entityId: assignment.id,
    },
  });

  return {
    id: assignment.id,
    taskId: assignment.taskId,
    task: {
      id: assignment.task.id,
      projectName: assignment.task.projectName,
      description: assignment.task.description,
    },
    assignedTo: {
      id: assignment.assignedTo.id,
      name: assignment.assignedTo.name,
      email: assignment.assignedTo.email,
      employeeId: assignment.assignedTo.employeeId,
      role: assignment.assignedTo.role,
    },
    assignedBy: assignment.assignedBy,
    assignedTime: assignment.assignedTime,
    completionDate: assignment.completionDate,
    status: assignment.status,
    createdBy: {
      id: assignment.createdBy.id,
      name: assignment.createdBy.name,
    },
  };
};

//
// 🔥 GET ALL ASSIGNMENTS BY COORDINATOR
//
exports.getAssignmentsByCoordinator = async (
  user,
  filters = {}
) => {
  //
  // ✅ ONLY COORDINATOR CAN VIEW THEIR ASSIGNMENTS
  //
  if (user.role !== "COORDINATOR") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const {
    status,
    skip = 0,
    take = 10,
    sortBy = "assignedTime",
    sortOrder = "desc",
  } = filters;

  const where = {
    createdById: user.id,
    ...(status && { status }),
  };

  const [assignments, total] = await Promise.all([
    prisma.coordinatorAssignment.findMany({
      where,
      include: {
        task: true,
        assignedTo: true,
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.coordinatorAssignment.count({ where }),
  ]);

  return {
    data: assignments.map((a) => ({
      id: a.id,
      taskId: a.taskId,
      task: {
        id: a.task.id,
        projectName: a.task.projectName,
        description: a.task.description,
      },
      assignedTo: {
        id: a.assignedTo.id,
        name: a.assignedTo.name,
        email: a.assignedTo.email,
        role: a.assignedTo.role,
      },
      assignedBy: a.assignedBy,
      assignedTime: a.assignedTime,
      completionDate: a.completionDate,
      reason: a.reason,
      status: a.status,
      submittedAt: a.submittedAt,
      completedAt: a.completedAt,
    })),
    pagination: {
      skip: parseInt(skip),
      take: parseInt(take),
      total,
      hasMore: parseInt(skip) + parseInt(take) < total,
    },
  };
};

//
// 🔥 GET ASSIGNMENTS ASSIGNED TO A USER
//
exports.getAssignmentsByAssignedTo = async (
  userId,
  filters = {}
) => {
  const {
    status,
    skip = 0,
    take = 10,
    sortBy = "assignedTime",
    sortOrder = "desc",
  } = filters;

  const where = {
    assignedToId: userId,
    ...(status && { status }),
  };

  const [assignments, total] = await Promise.all([
    prisma.coordinatorAssignment.findMany({
      where,
      include: {
        task: true,
        createdBy: true,
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.coordinatorAssignment.count({ where }),
  ]);

  return {
    data: assignments.map((a) => ({
      id: a.id,
      taskId: a.taskId,
      task: {
        id: a.task.id,
        projectName: a.task.projectName,
        description: a.task.description,
        status: a.task.status,
      },
      createdBy: {
        name: a.createdBy.name,
      },
      assignedBy: a.assignedBy,
      assignedTime: a.assignedTime,
      completionDate: a.completionDate,
      reason: a.reason,
      status: a.status,
      submittedAt: a.submittedAt,
      completedAt: a.completedAt,
    })),
    pagination: {
      skip: parseInt(skip),
      take: parseInt(take),
      total,
      hasMore: parseInt(skip) + parseInt(take) < total,
    },
  };
};

//
// 🔥 GET SINGLE ASSIGNMENT
//
exports.getAssignmentById = async (user, assignmentId) => {
  const assignment =
    await prisma.coordinatorAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: true,
        assignedTo: true,
        createdBy: true,
      },
    });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  //
  // ✅ AUTHORIZATION: Only coordinator who created it or assigned user can view
  //
  if (
    user.id !== assignment.createdById &&
    user.id !== assignment.assignedToId
  ) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return {
    id: assignment.id,
    taskId: assignment.taskId,
    task: {
      id: assignment.task.id,
      projectName: assignment.task.projectName,
      description: assignment.task.description,
      status: assignment.task.status,
    },
    assignedTo: {
      id: assignment.assignedTo.id,
      name: assignment.assignedTo.name,
      email: assignment.assignedTo.email,
      employeeId: assignment.assignedTo.employeeId,
      role: assignment.assignedTo.role,
    },
    createdBy: {
      id: assignment.createdBy.id,
      name: assignment.createdBy.name,
    },
    assignedBy: assignment.assignedBy,
    assignedTime: assignment.assignedTime,
    completionDate: assignment.completionDate,
    reason: assignment.reason,
    status: assignment.status,
    submittedAt: assignment.submittedAt,
    completedAt: assignment.completedAt,
    rejectedAt: assignment.rejectedAt,
  };
};

//
// 🔥 UPDATE ASSIGNMENT STATUS
//
// Statuses: ASSIGNED, IN_PROGRESS, SUBMITTED, COMPLETED, UNABLE_TO_SUBMIT, REJECTED
// Reason field is required only when status is not COMPLETED
//
exports.updateAssignmentStatus = async (
  user,
  assignmentId,
  body
) => {
  const { status, reason } = body;

  //
  // ✅ FIND ASSIGNMENT
  //
  const assignment =
    await prisma.coordinatorAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: true,
        assignedTo: true,
      },
    });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  //
  // ✅ AUTHORIZATION: Only assigned user can update status
  //
  if (user.id !== assignment.assignedToId) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  //
  // ✅ VALIDATE STATUS CHANGE
  //
  const validStatuses = [
    "IN_PROGRESS",
    "SUBMITTED",
    "COMPLETED",
    "UNABLE_TO_SUBMIT",
    "REJECTED",
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  //
  // ✅ REQUIRE REASON FOR NON-COMPLETION STATUSES
  //
  if (
    status !== "COMPLETED" &&
    status !== "SUBMITTED" &&
    (!reason || reason.trim() === "")
  ) {
    throw new ApiError(
      400,
      `Reason is required for status: ${status}`
    );
  }

  //
  // ✅ PREPARE UPDATE DATA
  //
  const updateData = {
    status,
    reason: reason || null,
  };

  // Add timestamp based on status
  if (status === "IN_PROGRESS" && !assignment.startedAt) {
    updateData.startedAt = new Date();
  } else if (status === "SUBMITTED" && !assignment.submittedAt) {
    updateData.submittedAt = new Date();
  } else if (status === "COMPLETED" && !assignment.completedAt) {
    updateData.completedAt = new Date();
  } else if (status === "REJECTED" && !assignment.rejectedAt) {
    updateData.rejectedAt = new Date();
    updateData.rejectionReason = reason;
  }

  //
  // ✅ UPDATE ASSIGNMENT
  //
  const updated =
    await prisma.coordinatorAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        task: true,
        assignedTo: true,
      },
    });

  //
  // ✅ SEND NOTIFICATION TO COORDINATOR
  //
  const statusMessage = {
    IN_PROGRESS: "started working on",
    SUBMITTED: "submitted",
    COMPLETED: "completed",
    UNABLE_TO_SUBMIT: "marked as unable to submit",
    REJECTED: "rejected",
  };

  await prisma.notification.create({
    data: {
      userId: assignment.task.createdById, // Notify the coordinator who created the assignment
      title: `Task Status Updated: ${status}`,
      message: `${user.name} has ${statusMessage[status]} "${assignment.task.projectName}"${reason ? ` - Reason: ${reason}` : ""}`,
      type: "TASK_SUBMITTED",
      level: "INFO",
      entityId: assignmentId,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    reason: updated.reason,
    submittedAt: updated.submittedAt,
    completedAt: updated.completedAt,
    rejectedAt: updated.rejectedAt,
    message: `Assignment status updated to ${status}`,
  };
};

//
// 🔥 LIST ALL ASSIGNMENTS (for admin or coordinator)
//
exports.listAllAssignments = async (user, filters = {}) => {
  //
  // ✅ ONLY COORDINATOR OR ADMIN CAN LIST ALL
  //
  if (!["COORDINATOR", "ADMIN"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const {
    status,
    coordinatorId,
    assignedToId,
    skip = 0,
    take = 10,
    sortBy = "assignedTime",
    sortOrder = "desc",
  } = filters;

  const where = {
    ...(status && { status }),
    ...(coordinatorId && { createdById: coordinatorId }),
    ...(assignedToId && { assignedToId }),
  };

  const [assignments, total] = await Promise.all([
    prisma.coordinatorAssignment.findMany({
      where,
      include: {
        task: true,
        assignedTo: true,
        createdBy: true,
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.coordinatorAssignment.count({ where }),
  ]);

  return {
    data: assignments.map((a) => ({
      id: a.id,
      taskId: a.taskId,
      task: {
        id: a.task.id,
        projectName: a.task.projectName,
      },
      assignedTo: {
        id: a.assignedTo.id,
        name: a.assignedTo.name,
        email: a.assignedTo.email,
        role: a.assignedTo.role,
      },
      createdBy: {
        id: a.createdBy.id,
        name: a.createdBy.name,
      },
      assignedBy: a.assignedBy,
      status: a.status,
      completionDate: a.completionDate,
    })),
    pagination: {
      skip: parseInt(skip),
      take: parseInt(take),
      total,
    },
  };
};
