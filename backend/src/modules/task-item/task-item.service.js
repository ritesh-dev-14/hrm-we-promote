const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE TASK ITEM WITH ASSIGNMENT
//
// Manager/HR creates a task item from their task and assigns to specific employee
//
// Fields:
// - title: String (required)
// - employeeId: String (required) - which employee to assign to
// - dueDate: DateTime (required)
// - priority: Priority enum - LOW, MEDIUM, HIGH (required)
// - description: String (optional)
// - status: TaskItemStatus - DRAFT or IN_PROGRESS (default: DRAFT)
//
exports.createTaskItem = async (
  user,
  taskId,
  body
) => {

  //
  // ✅ FIND TASK
  //
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      createdBy: true,
    },
  });

  if (!task) {
    throw new ApiError(
      404,
      ERRORS.TASK.NOT_FOUND
    );
  }

  //
  // ✅ ACCESS RULES
  //
  // ADMIN: can create for any task
  // HR: can create for own tasks
  // MANAGER: can create for tasks created by them OR assigned to them OR created by HR
  //
  let allowed = false;

  if (user.role === "ADMIN") {
    allowed = true;
  }

  else if (
    user.role === "HR" &&
    task.createdById === user.id
  ) {
    allowed = true;
  }

  else if (user.role === "MANAGER") {
    // Check if manager created the task
    if (task.createdById === user.id) {
      allowed = true;
    }
    // Check if assigned to task
    else {
      const assignment =
        await prisma.taskAssignment.findFirst({
          where: {
            taskId,
            userId: user.id,
          },
        });

      if (assignment) {
        allowed = true;
      }
      // Also allow if task was created by HR (managers work on HR tasks)
      else if (task.createdBy?.role === "HR") {
        allowed = true;
      }
    }
  }

  if (!allowed) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ FIND EMPLOYEE
  //
  const employee =
    await prisma.user.findUnique({
      where: {
        employeeId: body.employeeId,
      },
    });

  if (!employee || employee.role !== "EMPLOYEE") {
    throw new ApiError(
      400,
      "Employee not found or invalid"
    );
  }

  //
  // ✅ CREATE TASK ITEM
  //
  const item = await prisma.taskItem.create({
    data: {
      taskId,
      title: body.title,
      description: body.description || null,
      dueDate: new Date(body.dueDate),
      priority: body.priority || "MEDIUM",
      status: body.status || "DRAFT",
      referenceLink: body.referenceLink ?? null,
      rawDataLink: body.rawDataLink ?? null,
    },
  });

  //
  // ✅ CREATE ASSIGNMENT
  //
  const assignment = await prisma.taskItemAssignment.create({
    data: {
      taskItemId: item.id,
      userId: employee.id,
      status: "ASSIGNED",
    },
  });

  //
  // ✅ SEND NOTIFICATION
  //
  await prisma.notification.create({
    data: {
      userId: employee.id,
      title: "New Task Item Assigned",
      message: `Task item "${item.title}" assigned to you for project "${task.projectName}" due ${new Date(body.dueDate).toLocaleDateString()}`,
      type: "TASK_ASSIGNED",
      level: "INFO",
      entityId: item.id,
    },
  });

  //
  // ✅ RETURN RESPONSE
  //
  return {
    id: item.id,
    title: item.title,
    referenceLink: item.referenceLink,
    rawDataLink: item.rawDataLink,
    project: task.projectName,
    assignedToEmployee: {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
    },
    dueDate: item.dueDate,
    priority: item.priority,
    status: item.status,
    description: item.description,
    createdAt: item.createdAt,
  };
};


//
// 🔥 GET TASK ITEMS FOR A TASK
//
// Returns list of task items with:
// - title, project, due date, priority, status, assigned employee
//
exports.getTaskItems = async (
  user,
  taskId
) => {

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new ApiError(
      404,
      ERRORS.TASK.NOT_FOUND
    );
  }

  //
  // ✅ ACCESS CONTROL
  //
  let allowed = false;

  if (user.role === "ADMIN") {
    allowed = true;
  }

  else if (
    task.createdById === user.id
  ) {
    allowed = true;
  }

  else {
    const assignment =
      await prisma.taskAssignment.findFirst({
        where: {
          taskId,
          userId: user.id,
        },
      });

    if (assignment) {
      allowed = true;
    }
  }

  if (!allowed) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ GET ITEMS
  //
  const items =
    await prisma.taskItem.findMany({
      where: {
        taskId,
      },

      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },

      orderBy: {
        dueDate: "asc",
      },
    });

  //
  // ✅ FORMAT RESPONSE
  //
  return items.map((item) => {

    const assignment =
      item.assignments[0]; // One employee per item

    return {
      id: item.id,
      title: item.title,
      project: task.projectName,
      assignedToEmployee: assignment
        ? {
          id: assignment.employee.id,
          employeeId:
            assignment.employee.employeeId,
          name: assignment.employee.name,
          email: assignment.employee.email,
        }
        : null,
      referenceLink: item.referenceLink,
      rawDataLink: item.rawDataLink,
      dueDate: item.dueDate,
      priority: item.priority,
      status: item.status,
      description: item.description,
      progress: assignment?.progress || 0,
      assignmentStatus:
        assignment?.status || null,
      completedAt:
        assignment?.completedAt || null,
      createdAt: item.createdAt,
    };
  });
};


//
// 🔥 ASSIGN TASK ITEM
//
exports.assignTaskItem = async (
  user,
  itemId,
  body
) => {

  //
  // ✅ FIND ITEM
  //
  const item =
    await prisma.taskItem.findUnique({
      where: {
        id: itemId,
      },

      include: {
        task: true,
      },
    });

  if (!item) {
    throw new ApiError(
      404,
      "Task item not found"
    );
  }

  //
  // ✅ ONLY MANAGER CAN ASSIGN
  //
  if (
    !["MANAGER", "ADMIN"].includes(
      user.role
    )
  ) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ MANAGER MUST HAVE TASK (created by them or assigned to them)
  //
  if (user.role === "MANAGER") {

    // Check if manager created the task
    if (item.task.createdById === user.id) {
      // Manager created the task, so they can assign items
    }
    // Check if assigned to task
    else {
      const assignment =
        await prisma.taskAssignment.findFirst({
          where: {
            taskId: item.taskId,
            userId: user.id,
          },
        });

      if (!assignment) {
        throw new ApiError(
          403,
          ERRORS.AUTH.ACCESS_DENIED
        );
      }
    }
  }

  //
  // ✅ GET EMPLOYEE IDS
  //
  const employeeIds =
    body.assignments.map(
      (a) => a.employeeId
    );

  //
  // ✅ CHECK DUPLICATES
  //
  const uniqueIds =
    new Set(employeeIds);

  if (
    uniqueIds.size !==
    employeeIds.length
  ) {
    throw new ApiError(
      400,
      ERRORS.TASK.DUPLICATE_ASSIGNMENT
    );
  }

  const employeeWhere = {
    employeeId: {
      in: employeeIds,
    },

    role: "EMPLOYEE",
  };

  const employees =
    await prisma.user.findMany({
      where: employeeWhere,
    });

  //
  // ✅ VALIDATE
  //
  if (
    employees.length !==
    employeeIds.length
  ) {
    throw new ApiError(
      400,
      ERRORS.TASK.EMPLOYEE_NOT_FOUND
    );
  }

  //
  // ✅ CREATE ASSIGNMENTS
  //
  const assignments =
    employees.map((emp) => ({
      taskItemId: itemId,

      userId: emp.id,

      status: "ASSIGNED",

      progress: 0,
    }));

  await prisma.taskItemAssignment.createMany({
    data: assignments,

    skipDuplicates: true,
  });

  //
  // ✅ UPDATE ITEM STATUS
  //
  await prisma.taskItem.update({
    where: {
      id: itemId,
    },

    data: {
      status: "ASSIGNED",
    },
  });

  //
  // ✅ NOTIFICATIONS
  //
  await prisma.notification.createMany({
    data: employees.map(
      (emp) => ({
        userId: emp.id,

        title:
          "New Task Item Assigned",

        message:
          `You received sub task: ${item.title}`,

        type: "TASK_ASSIGNED",

        level: "INFO",

        entityId: item.id,
      })
    ),
  });

  return {
    success: true,

    message:
      "Task item assigned successfully",
  };
};

//
// 🔥 UPDATE TASK ITEM STATUS
//
// Employee or manager updates the status of a task item
// Status: DRAFT, IN_PROGRESS, COMPLETED
//
exports.updateTaskItemStatus = async (
  user,
  assignmentId,
  body
) => {

  //
  // ✅ FIND ASSIGNMENT
  //
  const assignment =
    await prisma.taskItemAssignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        taskItem: {
          include: {
            task: true,
          },
        },
        employee: true,
      },
    });

  if (!assignment) {
    throw new ApiError(
      404,
      "Assignment not found"
    );
  }

  //
  // ✅ ACCESS CONTROL
  //
  // Only the assigned employee or manager can update
  //
  let allowed = false;

  if (user.id === assignment.userId) {
    allowed = true;
  }

  // Manager or task creator can update
  else if (
    user.id ===
    assignment.taskItem.task.createdById
  ) {
    allowed = true;
  }

  else if (
    user.role === "ADMIN"
  ) {
    allowed = true;
  }

  if (!allowed) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ UPDATE ASSIGNMENT
  //
  const validStatuses = [
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
  ];

  if (
    !validStatuses.includes(
      body.status
    )
  ) {
    throw new ApiError(
      400,
      "Invalid status. Must be: ASSIGNED, IN_PROGRESS, or COMPLETED"
    );
  }

  const updateData = {
    status: body.status,
    progress: body.progress || 0,
  };

  // Update timestamps
  if (body.status === "IN_PROGRESS") {
    updateData.startedAt = new Date();
  }

  if (body.status === "COMPLETED") {
    updateData.completedAt = new Date();
    updateData.progress = 100;
  }

  const updated =
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },
      data: updateData,
      include: {
        taskItem: true,
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  //
  // ✅ SEND NOTIFICATION
  //
  if (body.status === "COMPLETED") {
    await prisma.notification.create({
      data: {
        userId:
          assignment.taskItem.task
            .createdById,

        title:
          "Task Item Completed",

        message:
          `${updated.employee.name} completed task item: "${assignment.taskItem.title}"`,

        type: "TASK_COMPLETED",

        level: "SUCCESS",

        entityId:
          assignment.taskItem.id,
      },
    });
  }

  return {
    id: updated.id,
    taskItemId:
      updated.taskItemId,
    employeeId: updated.userId,
    status: updated.status,
    progress: updated.progress,
    completedAt:
      updated.completedAt,
    startedAt: updated.startedAt,
  };
};