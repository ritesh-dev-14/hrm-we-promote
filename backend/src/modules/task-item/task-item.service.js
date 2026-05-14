const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE TASK ITEM
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
  let allowed = false;

  // ADMIN
  if (user.role === "ADMIN") {
    allowed = true;
  }

  // HR → can create items for own task
  else if (
    user.role === "HR" &&
    task.createdById === user.id
  ) {
    allowed = true;
  }

  // MANAGER → only if task assigned to manager
  else if (user.role === "MANAGER") {

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
  // ✅ CREATE ITEM
  //
  const item = await prisma.taskItem.create({
    data: {
      taskId,

      title: body.title,

      description:
        body.description || null,

      theme:
        body.theme || null,

      referenceLink:
        body.referenceLink || null,

      instructions:
        body.instructions || null,

      order: body.order || 0,

      status: "PENDING",
    },
  });

  return item;
};


//
// 🔥 GET TASK ITEMS
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
                role: true,
              },
            },

            submission: true,
          },
        },
      },

      orderBy: {
        order: "asc",
      },
    });

  //
  // ✅ FORMAT RESPONSE
  //
  return items.map((item) => {

    const completedAssignments =
      item.assignments.filter(
        (a) =>
          a.status === "COMPLETED"
      ).length;

    const progress =
      item.assignments.length > 0
        ? Math.round(
            item.assignments.reduce(
              (sum, a) =>
                sum + (a.progress || 0),
              0
            ) / item.assignments.length
          )
        : 0;

    return {
      id: item.id,

      title: item.title,

      description:
        item.description,

      theme: item.theme,

      referenceLink:
        item.referenceLink,

      instructions:
        item.instructions,

      order: item.order,

      status: item.status,

      progress,

      totalEmployees:
        item.assignments.length,

      completedAssignments,

      employees:
        item.assignments.map(
          (a) => ({
            assignmentId: a.id,

            employee: {
              id: a.employee.id,

              employeeId:
                a.employee.employeeId,

              name:
                a.employee.name,

              role:
                a.employee.role,
            },

            status: a.status,

            progress:
              a.progress || 0,

            submitted:
              !!a.submission,

            startedAt:
              a.startedAt,

            submittedAt:
              a.submittedAt,

            completedAt:
              a.completedAt,

              submission: a.submission
                ? {
                    id: a.submission.id,
                    driveLink: a.submission.driveLink,
                    remarks: a.submission.remarks,
                    verifiedByManager:
                      a.submission.verifiedByManager,
                    submittedAt: a.submission.submittedAt,
                  }
                : null,
          })
        ),
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
  // ✅ MANAGER MUST HAVE TASK
  //
  if (user.role === "MANAGER") {

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

  //
  // ✅ FIND EMPLOYEES
  //
  // const employees =
  //   await prisma.user.findMany({
  //     where: {
  //       employeeId: {
  //         in: employeeIds,
  //       },

  //       role: "EMPLOYEE",
  //     },
  //   });

  const employeeWhere = {
  employeeId: {
    in: employeeIds,
  },

  role: "EMPLOYEE",
};

// 🔥 MANAGER CAN ONLY ASSIGN OWN EMPLOYEES
if (user.role === "MANAGER") {
  employeeWhere.managerId = user.id;
}

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

      status: "PENDING",

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