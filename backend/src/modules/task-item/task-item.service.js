// const prisma = require("../../config/prisma");
// const ApiError = require("../../utils/ApiError");

// exports.createTaskItem = async (
//   user,
//   taskId,
//   body
// ) => {

//   const task = await prisma.task.findUnique({
//     where: { id: taskId }
//   });

//   if (!task) {
//     throw new ApiError(404, "Task not found");
//   }

//   const item = await prisma.taskItem.create({
//     data: {
//       taskId,

//       title: body.title,

//       description: body.description,

//       theme: body.theme,

//       referenceLink: body.referenceLink,

//       instructions: body.instructions,

//       order: body.order || 1,
//     }
//   });

//   return item;
// };

// exports.assignTaskItem = async (
//   user,
//   taskItemId,
//   body
// ) => {

//   const employee =
//     await prisma.user.findUnique({
//       where: {
//         employeeId: body.employeeId
//       }
//     });

//   if (!employee) {
//     throw new ApiError(
//       404,
//       "Employee not found"
//     );
//   }

//   await prisma.taskItemAssignment.create({
//     data: {
//       taskItemId,

//       userId: employee.id,
//     }
//   });

//   return {
//     success: true
//   };
// };

// exports.getMyTaskItems = async (user) => {

//   return prisma.taskItemAssignment.findMany({
//     where: {
//       userId: user.id
//     },

//     include: {
//       taskItem: {
//         include: {
//           task: true
//         }
//       },

//       submission: true
//     }
//   });

// };



const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");


// 🔥 CREATE TASK ITEM
exports.createTaskItem = async (
  user,
  taskId,
  body
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

  // 🔥 ONLY CREATOR CAN ADD ITEMS
  if (task.createdById !== user.id) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

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

      order: body.order || null,
    },
  });

  return item;
};


// 🔥 GET TASK ITEMS
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

  return items;
};


// 🔥 ASSIGN TASK ITEM
exports.assignTaskItem = async (
  user,
  itemId,
  body
) => {

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

  // 🔥 ONLY TASK CREATOR CAN ASSIGN
  if (item.task.createdById !== user.id) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  // 🔥 GET EMPLOYEE IDS
  const employeeIds =
    body.assignments.map(
      (a) => a.employeeId
    );

  // 🔥 CHECK DUPLICATES
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

  // 🔥 FIND EMPLOYEES
  const employees =
    await prisma.user.findMany({
      where: {
        employeeId: {
          in: employeeIds,
        },

        role: "EMPLOYEE",
      },
    });

  // 🔥 VALIDATE EMPLOYEES
  if (
    employees.length !==
    employeeIds.length
  ) {
    throw new ApiError(
      400,
      ERRORS.TASK.EMPLOYEE_NOT_FOUND
    );
  }

  // 🔥 CREATE ASSIGNMENTS
  const assignments =
    employees.map((emp) => ({
      taskItemId: itemId,

      userId: emp.id,
    }));

  await prisma.taskItemAssignment.createMany({
    data: assignments,

    skipDuplicates: true,
  });

  // 🔥 UPDATE ITEM STATUS
  await prisma.taskItem.update({
    where: {
      id: itemId,
    },

    data: {
      status: "ASSIGNED",
    },
  });

  return {
    success: true,
    message:
      "Task item assigned successfully",
  };
};