const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE TASK
//
exports.createTask = async (user, body) => {
  // ✅ ONLY ADMIN / HR / MANAGER
  if (!["ADMIN", "HR", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,

      description: body.description || null,

      instructions: body.instructions || null,

      referenceLink: body.referenceLink || null,

      date: new Date(body.date),

      location: body.location || null,

      setupType: body.setupType,

      createdById: user.id,

      // assignedToRole: body.assignedToRole,

      isGroupTask: body.isGroupTask || false,

      status: "DRAFT",
    },
  });

  return task;
};

//
// 🔥 ASSIGN TASK
//
// exports.assignTask = async (
//   user,
//   taskId,
//   body
// ) => {
//   // ✅ FIND TASK
//   const task = await prisma.task.findUnique({
//     where: {
//       id: taskId,
//     },
//   });

//   if (!task) {
//     throw new ApiError(
//       404,
//       ERRORS.TASK.NOT_FOUND
//     );
//   }

//   // ✅ ONLY CREATOR CAN ASSIGN
//   if (task.createdById !== user.id) {
//     throw new ApiError(
//       403,
//       ERRORS.AUTH.ACCESS_DENIED
//     );
//   }

//   // ✅ GET EMPLOYEE IDS
//   const employeeIds = body.assignments.map(
//     (a) => a.employeeId
//   );

//   // ✅ CHECK DUPLICATES
//   const uniqueIds = new Set(employeeIds);

//   if (uniqueIds.size !== employeeIds.length) {
//     throw new ApiError(
//       400,
//       ERRORS.TASK.DUPLICATE_ASSIGNMENT
//     );
//   }

//   // ✅ FIND USERS
//   // const employees = await prisma.user.findMany({
//   //   where: {
//   //     employeeId: {
//   //       in: employeeIds,
//   //     },

//   //     role: task.assignedToRole,
//   //   },
//   // });

// const employees = await prisma.user.findMany({
//   where: {
//     employeeId: {
//       in: employeeIds,
//     },

//     role: task.assignedToRole,
//   },
// });

//   // ✅ VALIDATE USERS
//   if (employees.length !== employeeIds.length) {
//     throw new ApiError(
//       400,
//       ERRORS.TASK.EMPLOYEE_NOT_FOUND
//     );
//   }

//   // ✅ CREATE ASSIGNMENTS
//   const assignments = body.assignments.map(
//     (a) => {
//       const emp = employees.find(
//         (e) =>
//           e.employeeId === a.employeeId
//       );

//       return {
//         taskId: task.id,

//         userId: emp.id,

//         groupId: a.groupId || null,
//       };
//     }
//   );

//   await prisma.taskAssignment.createMany({
//     data: assignments,

//     skipDuplicates: true,
//   });

//   // ✅ UPDATE TASK STATUS
//   await prisma.task.update({
//     where: {
//       id: taskId,
//     },

//     data: {
//       status: "ASSIGNED",
//     },
//   });

//   // ✅ SEND NOTIFICATIONS
//   await prisma.notification.createMany({
//     data: employees.map((emp) => ({
//       userId: emp.id,

//       title: "New Task Assigned",

//       message: `You have been assigned task: ${task.title}`,

//       type: "TASK_ASSIGNED",

//       level: "INFO",

//       entityId: task.id,
//     })),
//   });

//   return {
//     success: true,

//     message: "Task assigned successfully",
//   };
// };

//
// 🔥 ASSIGN TASK
//
exports.assignTask = async (user, taskId, body) => {
  // ✅ FIND TASK
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new ApiError(404, ERRORS.TASK.NOT_FOUND);
  }

  // ✅ ONLY CREATOR CAN ASSIGN
  if (task.createdById !== user.id) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  // ✅ GET EMPLOYEE IDS
  const employeeIds = body.assignments.map((a) => a.employeeId);

  // ✅ CHECK DUPLICATES
  const uniqueIds = new Set(employeeIds);

  if (uniqueIds.size !== employeeIds.length) {
    throw new ApiError(400, ERRORS.TASK.DUPLICATE_ASSIGNMENT);
  }

  // ✅ FIND USERS
  // const employees = await prisma.user.findMany({
  //   where: {
  //     employeeId: {
  //       in: employeeIds,
  //     },

  //     role: task.assignedToRole,
  //   },
  // });

  //
  // ✅ FIND USERS
  //
  const employees = await prisma.user.findMany({
    where: {
      employeeId: {
        in: employeeIds,
      },
    },
  });

  //
  // ✅ VALIDATE USERS EXIST
  //
  if (employees.length !== employeeIds.length) {
    throw new ApiError(400, ERRORS.TASK.EMPLOYEE_NOT_FOUND);
  }

  //
  // ✅ ROLE-BASED ASSIGNMENT RULES
  //
  employees.forEach((emp) => {
    // 🔥 MANAGER
    if (user.role === "MANAGER") {
      // Explicitly prevent assigning to HR
      if (emp.role === "HR") {
        throw new ApiError(403, `Manager cannot assign task to HR`);
      }
      // manager can assign:
      // - EMPLOYEE
      // - itself

      const allowed = emp.role === "EMPLOYEE" || emp.id === user.id;

      if (!allowed) {
        throw new ApiError(403, `Manager cannot assign task to ${emp.role}`);
      }
    }

    // 🔥 HR
    else if (user.role === "HR") {
      // HR can assign:
      // - EMPLOYEE
      // - MANAGER
      // - itself

      const allowed =
        ["EMPLOYEE", "MANAGER"].includes(emp.role) || emp.id === user.id;

      if (!allowed) {
        throw new ApiError(403, `HR cannot assign task to ${emp.role}`);
      }
    }

    // 🔥 ADMIN
    else if (user.role === "ADMIN") {
      // admin can assign to anyone
    }
  });

  // ✅ VALIDATE USERS
  if (employees.length !== employeeIds.length) {
    throw new ApiError(400, ERRORS.TASK.EMPLOYEE_NOT_FOUND);
  }

  // ✅ CREATE ASSIGNMENTS
  const assignments = body.assignments.map((a) => {
    const emp = employees.find((e) => e.employeeId === a.employeeId);

    return {
      taskId: task.id,

      userId: emp.id,

      taskGroupId: a.taskGroupId || null,
    };
  });

  await prisma.taskAssignment.createMany({
    data: assignments,

    skipDuplicates: true,
  });

  // ✅ UPDATE TASK STATUS
  await prisma.task.update({
    where: {
      id: taskId,
    },

    data: {
      status: "ASSIGNED",
    },
  });

  // ✅ SEND NOTIFICATIONS
  await prisma.notification.createMany({
    data: employees.map((emp) => ({
      userId: emp.id,

      title: "New Task Assigned",

      message: `You have been assigned task: ${task.title}`,

      type: "TASK_ASSIGNED",

      level: "INFO",

      entityId: task.id,
    })),
  });

  return {
    success: true,

    message: "Task assigned successfully",
  };
};

//
// 🔥 GET TASKS CREATED BY USER
//
// exports.getTasks = async (user) => {
//   const tasks = await prisma.task.findMany({
//     where: {
//       createdById: user.id,
//     },

//     include: {
//       assignments: {
//         include: {
//           employee: {
//             select: {
//               id: true,

//               employeeId: true,

//               name: true,

//               role: true,
//             },
//           },

//           submission: true,
//         },
//       },

//       items: true,
//     },

//     orderBy: {
//       date: "asc",
//     },
//   });

//   return tasks.map((task) => {
//     const groupsMap = {};

//     const individuals = [];

//     task.assignments.forEach((a) => {
//       const emp = {
//         employeeId:
//           a.employee.employeeId,

//         name: a.employee.name,

//         role: a.employee.role,

//         status: a.status,

//         submitted: !!a.submission,
//       };

//       // ✅ GROUP TASK
//       if (a.groupId) {
//         if (!groupsMap[a.groupId]) {
//           groupsMap[a.groupId] = {
//             groupId: a.groupId,

//             members: [],
//           };
//         }

//         groupsMap[a.groupId].members.push(
//           emp
//         );
//       }

//       // ✅ INDIVIDUAL TASK
//       else {
//         individuals.push(emp);
//       }
//     });

//     return {
//       id: task.id,

//       title: task.title,

//       description: task.description,

//       instructions: task.instructions,

//       referenceLink: task.referenceLink,

//       date: task.date,

//       location: task.location,

//       setupType: task.setupType,

//       assignedToRole:
//         task.assignedToRole,

//       status: task.status,

//       isGroupTask: task.isGroupTask,

//       totalEmployees:
//         task.assignments.length,

//       totalItems: task.items.length,

//       groups: Object.values(groupsMap),

//       individuals,
//     };
//   });
// };

//
// 🔥 GET TASKS CREATED BY USER
//
exports.getTasks = async (user) => {
  const tasks = await prisma.task.findMany({
    where: {
      createdById: user.id,
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

          taskGroup: true,
        },
      },

      items: true,
    },

    orderBy: {
      date: "asc",
    },
  });

  return tasks.map((task) => {
    const groupsMap = {};

    const individuals = [];

    task.assignments.forEach((a) => {
      const emp = {
        employeeId: a.employee.employeeId,

        name: a.employee.name,

        role: a.employee.role,

        status: a.status,

        submitted: !!a.submission,
      };

      // ✅ GROUP TASK
      if (a.taskGroupId) {
        if (!groupsMap[a.taskGroupId]) {
          groupsMap[a.taskGroupId] = {
            taskGroupId: a.taskGroupId,

            // groupName: a.group?.name || null,
            groupName: a.taskGroup?.name || null,

            members: [],
          };
        }

        groupsMap[a.taskGroupId].members.push(emp);
      }

      // ✅ INDIVIDUAL TASK
      else {
        individuals.push(emp);
      }
    });

    return {
      id: task.id,

      title: task.title,

      description: task.description,

      instructions: task.instructions,

      referenceLink: task.referenceLink,

      date: task.date,

      location: task.location,

      setupType: task.setupType,

      assignedToRole: task.assignedToRole,

      status: task.status,

      isGroupTask: task.isGroupTask,

      totalEmployees: task.assignments.length,

      totalItems: task.items.length,

      groups: Object.values(groupsMap),

      individuals,
    };
  });
};

//
// 🔥 GET SINGLE TASK
//
exports.getTaskById = async (user, taskId) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
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

      items: true,
    },
  });

  if (!task) {
    throw new ApiError(404, ERRORS.TASK.NOT_FOUND);
  }

  if (task.createdById !== user.id) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return task;
};

//
// 🔥 GET MY ASSIGNED TASKS
//
exports.getMyAssignedTasks = async (user) => {
  const assignments =
    await prisma.taskAssignment.findMany({
      where: {
        userId: user.id,
      },

      include: {
        task: {
          include: {
            createdBy: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                role: true,
              },
            },

            items: true,
          },
        },

        submission: true,

        taskGroup: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return assignments.map((a) => ({
    assignmentId: a.id,

    status: a.status,

    submitted: !!a.submission,

    submittedAt: a.submittedAt,

    taskGroup: a.taskGroup
      ? {
          id: a.taskGroup.id,
          name: a.taskGroup.name,
        }
      : null,

    task: {
      id: a.task.id,

      title: a.task.title,

      description: a.task.description,

      instructions: a.task.instructions,

      referenceLink:
        a.task.referenceLink,

      date: a.task.date,

      location: a.task.location,

      setupType: a.task.setupType,

      status: a.task.status,

      isGroupTask:
        a.task.isGroupTask,

      totalItems:
        a.task.items.length,

      createdBy: a.task.createdBy,
    },
  }));
};