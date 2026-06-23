const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const mailService = require("../mail/mail.service");

const sendBestEffortMail = async (operation, context) => {
  try {
    await operation();
  } catch (error) {
    console.error(`Mail notification failed for ${context}:`, error);
  }
};

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
  // Check if coordinator user exists in DB before connecting
  const coordinatorExists = user && user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;

  const task = await prisma.task.create({
    data: {
      projectName: body.task, // Use task name as project name
      description: body.task, // Use task name as description
      startDate: new Date(),
      endDate: new Date(body.completionDate),
      ...(coordinatorExists ? { createdById: coordinatorExists.id } : {}),
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
  let assignment;

  if (coordinatorExists) {
    assignment = await prisma.coordinatorAssignment.create({
      data: {
        taskId: task.id,
        assignedToId: body.assignedToId,
        createdById: coordinatorExists.id,
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
  } else {
    assignment = await prisma.coordinatorAssignment.create({
      data: {
        taskId: task.id,
        assignedToId: body.assignedToId,
        assignedBy: body.assignedBy,
        completionDate: new Date(body.completionDate),
        employeeNumber: body.employeeNumber,
        employeeEmail: body.employeeEmail,
        status: "ASSIGNED",
      },
      include: {
        task: true,
        assignedTo: true,
      },
    });
  }

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

  await sendBestEffortMail(
    () => mailService.sendCoordinatorAssignmentMail({
      email: assignment.assignedTo.email,
      recipientName: assignment.assignedTo.name,
      coordinatorName: assignment.createdBy?.name || body.assignedBy,
      taskTitle: assignment.task.projectName,
      completionDate: assignment.completionDate,
      assignedBy: assignment.assignedBy,
      recipientRole: assignment.assignedTo.role,
    }),
    `coordinator assignment ${assignment.id}`
  );

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
    ...(assignment.createdBy ? {
      createdBy: {
        id: assignment.createdBy.id,
        name: assignment.createdBy.name,
      },
    } : {}),
  };
};

//
// 🔥 CREATE COORDINATOR TASK (By Any User - Employee/HR/Manager)
//
// Any user can create a task/requirement that goes to a coordinator
// Fields:
// - taskName: String (required) - Task/requirement name
// - description: String (required) - Task description
// - startDate: DateTime (required) - Start date
// - endDate: DateTime (required) - Till date (deadline)
// - assignedToCoordinatorId: String (required) - Coordinator ID to assign to
//
exports.createCoordinatorTask = async (user, body) => {
  //
  // ✅ VERIFY USER IS AUTHENTICATED (Any role can create)
  //
  if (!user || !user.id) {
    throw new ApiError(401, ERRORS.AUTH.UNAUTHORIZED);
  }

  //
  // ✅ FIND COORDINATOR USER
  //
  const coordinator = await prisma.user.findUnique({
    where: { id: body.assignedToCoordinatorId },
  });

  if (!coordinator) {
    throw new ApiError(400, "Coordinator not found");
  }

  //
  // ✅ VERIFY COORDINATOR ROLE
  //
  if (coordinator.role !== "COORDINATOR") {
    throw new ApiError(400, "Selected user is not a coordinator");
  }

  //
  // ✅ GET CURRENT USER DETAILS
  //
  const createdByUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!createdByUser) {
    throw new ApiError(400, "User not found");
  }

  //
  // ✅ CREATE NEW TASK
  //
  const task = await prisma.task.create({
    data: {
      projectName: body.taskName,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      createdById: user.id,
      status: "DRAFT",
    },
  });

  //
  // ✅ CREATE COORDINATOR ASSIGNMENT
  //
  const assignment = await prisma.coordinatorAssignment.create({
    data: {
      taskId: task.id,
      assignedToId: body.assignedToCoordinatorId,
      createdById: user.id,
      assignedBy: createdByUser.name, // Use creator's name
      completionDate: new Date(body.endDate),
      employeeNumber: coordinator.employeeId,
      employeeEmail: coordinator.email,
      status: "ASSIGNED",
    },
    include: {
      task: true,
      assignedTo: true,
      createdBy: true,
    },
  });

  //
  // ✅ SEND NOTIFICATION TO COORDINATOR
  //
  await prisma.notification.create({
    data: {
      userId: body.assignedToCoordinatorId,
      title: "New Task Requirement",
      message: `New requirement "${body.taskName}" created by ${createdByUser.name}. Due date: ${new Date(body.endDate).toLocaleDateString()}`,
      type: "TASK_ASSIGNED",
      level: "INFO",
      entityId: assignment.id,
    },
  });

  //
  // ✅ SEND EMAIL NOTIFICATION (Best Effort)
  //
  await sendBestEffortMail(
    () => mailService.sendCoordinatorAssignmentMail({
      email: coordinator.email,
      recipientName: coordinator.name,
      coordinatorName: createdByUser.name,
      taskTitle: body.taskName,
      completionDate: new Date(body.endDate),
      assignedBy: createdByUser.name,
      recipientRole: coordinator.role,
    }),
    `task requirement ${assignment.id}`
  );

  return {
    id: assignment.id,
    taskId: assignment.taskId,
    task: {
      id: assignment.task.id,
      name: assignment.task.projectName,
      description: assignment.task.description,
      startDate: assignment.task.startDate,
      endDate: assignment.task.endDate,
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
      email: assignment.createdBy.email,
      role: assignment.createdBy.role,
    },
    assignedBy: assignment.assignedBy,
    assignedTime: assignment.assignedTime,
    completionDate: assignment.completionDate,
    status: assignment.status,
  };
};

//
// 🔥 GET MY TASKS (For Coordinator)
//
// Get all tasks/requirements assigned TO this coordinator
// Created by other users (employees, HR, managers)
//
exports.getMyTasks = async (user, filters = {}) => {
  //
  // ✅ ONLY COORDINATOR CAN VIEW THEIR TASKS
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
    assignedToId: user.id, // Tasks assigned TO this coordinator
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
        name: a.task.projectName,
        description: a.task.description,
        startDate: a.task.startDate,
        endDate: a.task.endDate,
      },
      createdBy: {
        id: a.createdBy.id,
        name: a.createdBy.name,
        email: a.createdBy.email,
        role: a.createdBy.role,
      },
      assignedBy: a.assignedBy,
      assignedTime: a.assignedTime,
      completionDate: a.completionDate,
      status: a.status,
      submittedAt: a.submittedAt,
      completedAt: a.completedAt,
      reason: a.reason,
    })),
    pagination: {
      skip: parseInt(skip),
      take: parseInt(take),
      total,
      pages: Math.ceil(total / parseInt(take)),
    },
  };
};

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
      ...(a.createdBy ? {
        createdBy: {
          name: a.createdBy.name,
        },
      } : {}),
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
// 🔥 GET TASKS CREATED BY CURRENT USER
//
exports.getMyCreatedTasks = async (user, filters = {}) => {
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
        status: a.task.status,
      },
      assignedTo: {
        id: a.assignedTo.id,
        name: a.assignedTo.name,
        email: a.assignedTo.email,
        employeeId: a.assignedTo.employeeId,
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
    assignment.createdById && user.id !== assignment.createdById &&
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
    ...(assignment.createdBy ? {
      createdBy: {
        id: assignment.createdBy.id,
        name: assignment.createdBy.name,
      },
    } : {}),
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
  // ✅ REQUIRE REASON ONLY FOR UNABLE_TO_SUBMIT AND REJECTED
  //
  if (
    (status === "UNABLE_TO_SUBMIT" || status === "REJECTED") &&
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
      ...(a.createdBy ? {
        createdBy: {
          id: a.createdBy.id,
          name: a.createdBy.name,
        },
      } : {}),
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

//
// 🔥 GET ALL COORDINATORS
// Accessible to all authenticated users except coordinators
//
exports.getAllCoordinators = async (user) => {
  if (user.role === "COORDINATOR") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const coordinators = await prisma.user.findMany({
    where: {
      role: "COORDINATOR",
    },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      role: true,
      department: true,
      position: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return {
    data: coordinators,
    total: coordinators.length,
  };
};

//
// 🔥 GET ALL USERS (HR, MANAGER, EMPLOYEES)
// Coordinator can see all users to assign tasks
//
exports.getAllUsers = async (user) => {
  //
  // ✅ ONLY COORDINATOR CAN ACCESS THIS
  //
  if (user.role !== "COORDINATOR") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  //
  // ✅ GET ALL USERS (except coordinator themselves and admin)
  //
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["EMPLOYEE", "MANAGER", "HR"],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      role: true,
      department: true,
    },
    orderBy: [{ role: "desc" }, { name: "asc" }],
  });

  return {
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      employeeId: u.employeeId,
      role: u.role,
      department: u.department,
    })),
    total: users.length,
  };
};

  //
  // 🔥 SEND FOLLOW-UP MESSAGE (Coordinator -> Assigned User)
  //
  exports.sendFollowUpMessage = async (user, assignmentId, body) => {
    const { message } = body;

    if (user.role !== "COORDINATOR") {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }

    const assignment = await prisma.coordinatorAssignment.findUnique({
      where: { id: assignmentId },
      include: { assignedTo: true, task: true },
    });

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    // Create follow-up message
    const followUp = await prisma.coordinatorFollowUp.create({
      data: {
        assignmentId: assignmentId,
        senderId: user.id,
        message,
        messageType: "FOLLOW_UP",
        senderRole: user.role,
      },
    });

    // Notify assigned user
    await prisma.notification.create({
      data: {
        userId: assignment.assignedToId,
        title: "Follow-up from Coordinator",
        message: `${user.name} sent a follow-up on task: ${assignment.taskId}`,
        type: "GENERAL",
        level: "INFO",
        entityId: assignmentId,
      },
    });

    await sendBestEffortMail(
      () => mailService.sendCoordinatorFollowUpMail({
        email: assignment.assignedTo.email,
        employeeName: assignment.assignedTo.name,
        coordinatorName: user.name,
        taskTitle: assignment.task?.projectName || `Task ${assignment.taskId}`,
        message,
      }),
      `follow-up ${followUp.id}`
    );

    return {
      id: followUp.id,
      assignmentId: followUp.assignmentId,
      senderId: followUp.senderId,
      message: followUp.message,
      messageType: followUp.messageType,
      senderRole: followUp.senderRole,
      createdAt: followUp.createdAt,
    };
  };

  //
  // 🔥 REPLY TO FOLLOW-UP (Assigned User -> Coordinator)
  //
  exports.replyToFollowUp = async (user, assignmentId, body) => {
    const { message } = body;

    const assignment = await prisma.coordinatorAssignment.findUnique({
      where: { id: assignmentId },
      include: { assignedTo: true, task: true },
    });

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    // Only the assigned user can reply
    if (user.id !== assignment.assignedToId) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }

    const followUp = await prisma.coordinatorFollowUp.create({
      data: {
        assignmentId: assignmentId,
        senderId: user.id,
        message,
        messageType: "REPLY",
        senderRole: user.role,
      },
    });

    // Notify coordinator
    if (assignment.createdById) {
      await prisma.notification.create({
        data: {
          userId: assignment.createdById,
          title: "Reply to Follow-up",
          message: `${user.name} replied to your follow-up on task: ${assignment.taskId}`,
          type: "GENERAL",
          level: "INFO",
          entityId: assignmentId,
        },
      });

      // Fetch coordinator for email
      const coordinator = await prisma.user.findUnique({
        where: { id: assignment.createdById },
        select: { email: true, name: true },
      });

      if (coordinator) {
        await sendBestEffortMail(
          () => mailService.sendEmployeeReplyMail({
            email: coordinator.email,
            coordinatorName: coordinator.name,
            employeeName: user.name,
            taskTitle: assignment.task?.projectName || `Task ${assignment.taskId}`,
            message,
          }),
          `reply ${followUp.id}`
        );
      }
    }

    return {
      id: followUp.id,
      assignmentId: followUp.assignmentId,
      senderId: followUp.senderId,
      message: followUp.message,
      messageType: followUp.messageType,
      senderRole: followUp.senderRole,
      createdAt: followUp.createdAt,
    };
  };

  //
  // 🔥 GET FOLLOW-UP MESSAGES FOR AN ASSIGNMENT
  //
  exports.getFollowUpMessages = async (user, assignmentId) => {
    const assignment = await prisma.coordinatorAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    // Only coordinator who created or assigned user can view messages
    if (user.id !== assignment.createdById && user.id !== assignment.assignedToId) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }

    const messages = await prisma.coordinatorFollowUp.findMany({
      where: { assignmentId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((m) => ({
      id: m.id,
      assignmentId: m.assignmentId,
      sender: {
        id: m.sender.id,
        name: m.sender.name,
        role: m.sender.role,
      },
      message: m.message,
      messageType: m.messageType,
      senderRole: m.senderRole,
      createdAt: m.createdAt,
    }));
  };
