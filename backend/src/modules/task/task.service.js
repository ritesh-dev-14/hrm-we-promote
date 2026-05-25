// const prisma = require("../../config/prisma");
// const ApiError = require("../../utils/ApiError");
// const ERRORS = require("../../utils/errors");

// //
// // 🔥 CREATE TASK
// //
// exports.createTask = async (user, body) => {
//   // ✅ ONLY ADMIN / HR / MANAGER
//   if (!["ADMIN", "HR", "MANAGER"].includes(user.role)) {
//     throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
//   }

//   const task = await prisma.task.create({
//     data: {
//       title: body.title,

//       description: body.description || null,

//       instructions: body.instructions || null,

//       referenceLink: body.referenceLink || null,

//       date: new Date(body.date),

//       location: body.location || null,

//       setupType: body.setupType,

//       createdById: user.id,

//       // assignedToRole: body.assignedToRole,

//       isGroupTask: body.isGroupTask || false,

//       status: "DRAFT",
//     },
//   });

//   return task;
// };

// //
// // 🔥 ASSIGN TASK
// //
// exports.assignTask = async (user, taskId, body) => {
//   // ✅ FIND TASK
//   const task = await prisma.task.findUnique({
//     where: {
//       id: taskId,
//     },
//   });

//   if (!task) {
//     throw new ApiError(404, ERRORS.TASK.NOT_FOUND);
//   }

//   // ✅ ONLY CREATOR CAN ASSIGN
//   if (task.createdById !== user.id) {
//     throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
//   }

//   // ✅ GET EMPLOYEE IDS
//   const employeeIds = body.assignments.map((a) => a.employeeId);

//   // ✅ CHECK DUPLICATES
//   const uniqueIds = new Set(employeeIds);

//   if (uniqueIds.size !== employeeIds.length) {
//     throw new ApiError(400, ERRORS.TASK.DUPLICATE_ASSIGNMENT);
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

//   //
//   // ✅ FIND USERS
//   //
//   const employees = await prisma.user.findMany({
//     where: {
//       employeeId: {
//         in: employeeIds,
//       },
//     },
//   });

//   //
//   // ✅ VALIDATE USERS EXIST
//   //
//   if (employees.length !== employeeIds.length) {
//     throw new ApiError(400, ERRORS.TASK.EMPLOYEE_NOT_FOUND);
//   }

//   //
//   // ✅ ROLE-BASED ASSIGNMENT RULES
//   //
//   employees.forEach((emp) => {
//     // 🔥 MANAGER
//     if (user.role === "MANAGER") {
//       // Explicitly prevent assigning to HR
//       if (emp.role === "HR") {
//         throw new ApiError(403, `Manager cannot assign task to HR`);
//       }
//       // manager can assign:
//       // - EMPLOYEE
//       // - itself

//       const allowed = emp.role === "EMPLOYEE" || emp.id === user.id;

//       if (!allowed) {
//         throw new ApiError(403, `Manager cannot assign task to ${emp.role}`);
//       }
//     }

//     // 🔥 HR
//     else if (user.role === "HR") {
//       // HR can assign:
//       // - EMPLOYEE
//       // - MANAGER
//       // - itself

//       const allowed =
//         ["EMPLOYEE", "MANAGER"].includes(emp.role) || emp.id === user.id;

//       if (!allowed) {
//         throw new ApiError(403, `HR cannot assign task to ${emp.role}`);
//       }
//     }

//     // 🔥 ADMIN
//     else if (user.role === "ADMIN") {
//       // admin can assign to anyone
//     }
//   });

//   // ✅ VALIDATE USERS
//   if (employees.length !== employeeIds.length) {
//     throw new ApiError(400, ERRORS.TASK.EMPLOYEE_NOT_FOUND);
//   }

//   // ✅ CREATE ASSIGNMENTS
//   const assignments = body.assignments.map((a) => {
//     const emp = employees.find((e) => e.employeeId === a.employeeId);

//     return {
//       taskId: task.id,

//       userId: emp.id,

//       taskGroupId: a.taskGroupId || null,
//     };
//   });

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

// //
// // 🔥 GET TASKS CREATED BY USER
// //
// // exports.getTasks = async (user) => {
// //   const tasks = await prisma.task.findMany({
// //     where: {
// //       createdById: user.id,
// //     },

// //     include: {
// //       assignments: {
// //         include: {
// //           employee: {
// //             select: {
// //               id: true,

// //               employeeId: true,

// //               name: true,

// //               role: true,
// //             },
// //           },

// //           submission: true,
// //         },
// //       },

// //       items: true,
// //     },

// //     orderBy: {
// //       date: "asc",
// //     },
// //   });

// //   return tasks.map((task) => {
// //     const groupsMap = {};

// //     const individuals = [];

// //     task.assignments.forEach((a) => {
// //       const emp = {
// //         employeeId:
// //           a.employee.employeeId,

// //         name: a.employee.name,

// //         role: a.employee.role,

// //         status: a.status,

// //         submitted: !!a.submission,
// //       };

// //       // ✅ GROUP TASK
// //       if (a.groupId) {
// //         if (!groupsMap[a.groupId]) {
// //           groupsMap[a.groupId] = {
// //             groupId: a.groupId,

// //             members: [],
// //           };
// //         }

// //         groupsMap[a.groupId].members.push(
// //           emp
// //         );
// //       }

// //       // ✅ INDIVIDUAL TASK
// //       else {
// //         individuals.push(emp);
// //       }
// //     });

// //     return {
// //       id: task.id,

// //       title: task.title,

// //       description: task.description,

// //       instructions: task.instructions,

// //       referenceLink: task.referenceLink,

// //       date: task.date,

// //       location: task.location,

// //       setupType: task.setupType,

// //       assignedToRole:
// //         task.assignedToRole,

// //       status: task.status,

// //       isGroupTask: task.isGroupTask,

// //       totalEmployees:
// //         task.assignments.length,

// //       totalItems: task.items.length,

// //       groups: Object.values(groupsMap),

// //       individuals,
// //     };
// //   });
// // };

// //
// // 🔥 GET TASKS CREATED BY USER
// //
// // exports.getTasks = async (user) => {
// //   const tasks = await prisma.task.findMany({
// //     where: {
// //       createdById: user.id,
// //     },

// //     include: {
// //       assignments: {
// //         include: {
// //           employee: {
// //             select: {
// //               id: true,
// //               employeeId: true,
// //               name: true,
// //               role: true,
// //             },
// //           },

// //           submission: true,

// //           taskGroup: true,
// //         },
// //       },

// //       items: true,
// //     },

// //     orderBy: {
// //       date: "asc",
// //     },
// //   });

// //   return tasks.map((task) => {
// //     const groupsMap = {};

// //     const individuals = [];

// //     task.assignments.forEach((a) => {
// //       const emp = {
// //         employeeId: a.employee.employeeId,

// //         name: a.employee.name,

// //         role: a.employee.role,

// //         status: a.status,

// //         submitted: !!a.submission,
// //       };

// //       // ✅ GROUP TASK
// //       if (a.taskGroupId) {
// //         if (!groupsMap[a.taskGroupId]) {
// //           groupsMap[a.taskGroupId] = {
// //             taskGroupId: a.taskGroupId,

// //             // groupName: a.group?.name || null,
// //             groupName: a.taskGroup?.name || null,

// //             members: [],
// //           };
// //         }

// //         groupsMap[a.taskGroupId].members.push(emp);
// //       }

// //       // ✅ INDIVIDUAL TASK
// //       else {
// //         individuals.push(emp);
// //       }
// //     });

// //     return {
// //       id: task.id,

// //       title: task.title,

// //       description: task.description,

// //       instructions: task.instructions,

// //       referenceLink: task.referenceLink,

// //       date: task.date,

// //       location: task.location,

// //       setupType: task.setupType,

// //       assignedToRole: task.assignedToRole,

// //       status: task.status,

// //       isGroupTask: task.isGroupTask,

// //       totalEmployees: task.assignments.length,

// //       totalItems: task.items.length,

// //       groups: Object.values(groupsMap),

// //       individuals,
// //     };
// //   });
// // };

// //
// // 🔥 GET SINGLE TASK
// //
// exports.getTaskById = async (user, taskId) => {
//   const task = await prisma.task.findUnique({
//     where: {
//       id: taskId,
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
//   });

//   if (!task) {
//     throw new ApiError(404, ERRORS.TASK.NOT_FOUND);
//   }

//   // Allow access if the user is the creator, an assignee, or an admin
//   const isCreator = task.createdById === user.id;
//   const isAdmin = user.role === "ADMIN";

//   const assignment = await prisma.taskAssignment.findFirst({
//     where: {
//       taskId: task.id,
//       userId: user.id,
//     },
//   });

//   const isAssigned = !!assignment;

//   if (!isCreator && !isAssigned && !isAdmin) {
//     throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
//   }

//   return task;
// };


// exports.getMyAssignedTasks =
//   async (user) => {
//     // Allow manager to fetch only tasks assigned by HR (tasks created by HR).
//     const whereClause = {
//       userId: user.id,
//     };

//     if (user.role === "MANAGER") {
//       // Manager's "my-tasks" should show tasks assigned by HR by default
//       whereClause.task = {
//         createdBy: {
//           role: "HR",
//         },
//       };
//     }

//     const assignments = await prisma.taskAssignment.findMany({
//       where: whereClause,

//       include: {
//           task: {
//             include: {
//               createdBy: {
//                 select: {
//                   id: true,
//                   employeeId: true,
//                   name: true,
//                   role: true,
//                 },
//               },

//               items: true,
//             },
//           },

//           submission: true,

//           taskGroup: true,
//         },

//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//     return assignments.map(
//       (a) => ({
//         assignmentId: a.id,

//         status: a.status,

//         progress:
//           a.progress || 0,

//         submitted:
//           !!a.submission,

//         startedAt:
//           a.startedAt,

//         submittedAt:
//           a.submittedAt,

//         verifiedAt:
//           a.verifiedAt,

//         completedAt:
//           a.completedAt,

//         rejectedAt:
//           a.rejectedAt,

//         rejectionReason:
//           a.rejectionReason,

//         taskGroup:
//           a.taskGroup
//             ? {
//                 id:
//                   a.taskGroup.id,

//                 name:
//                   a.taskGroup
//                     .name,
//               }
//             : null,

//         task: {
//           id: a.task.id,

//           title:
//             a.task.title,

//           description:
//             a.task.description,

//           date: a.task.date,

//           location:
//             a.task.location,

//           setupType:
//             a.task.setupType,

//           status:
//             a.task.status,

//           totalItems:
//             a.task.items.length,

//           createdBy:
//             a.task.createdBy,
//         },
//       })
//     );
//   };

// exports.updateTaskAssignmentStatus =
//   async (
//     user,
//     assignmentId,
//     body
//   ) => {
//     const assignment =
//       await prisma.taskAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           task: true,
//         },
//       });

//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     if (
//       assignment.userId !==
//       user.id
//     ) {
//       throw new ApiError(
//         403,
//         ERRORS.AUTH.ACCESS_DENIED
//       );
//     }

//     const updateData = {
//       status: body.status,
//     };

//     if (
//       body.progress !==
//       undefined
//     ) {
//       updateData.progress =
//         body.progress;
//     }

//     if (
//       body.status ===
//       "IN_PROGRESS"
//     ) {
//       updateData.startedAt =
//         new Date();
//     }

//     if (
//       body.status ===
//       "SUBMITTED"
//     ) {
//       updateData.submittedAt =
//         new Date();

//       updateData.progress = 100;
//     }

//     if (
//       body.status ===
//       "VERIFIED"
//     ) {
//       updateData.verifiedAt =
//         new Date();
//     }

//     if (
//       body.status ===
//       "COMPLETED"
//     ) {
//       updateData.completedAt =
//         new Date();

//       updateData.progress = 100;
//     }

//     if (
//       body.status ===
//       "REJECTED"
//     ) {
//       updateData.rejectedAt =
//         new Date();

//       updateData.rejectionReason =
//         body.rejectionReason ||
//         null;
//     }

//     const updated =
//       await prisma.taskAssignment.update({
//         where: {
//           id: assignmentId,
//         },

//         data: updateData,
//       });

//     //
//     // 🔥 UPDATE MAIN TASK STATUS
//     //

//     const allAssignments =
//       await prisma.taskAssignment.findMany({
//         where: {
//           taskId:
//             assignment.taskId,
//         },
//       });

//     const statuses =
//       allAssignments.map(
//         (a) => a.status
//       );

//     let taskStatus =
//       "PENDING";

//     if (
//       statuses.every(
//         (s) =>
//           s ===
//           "COMPLETED"
//       )
//     ) {
//       taskStatus =
//         "COMPLETED";
//     } else if (
//       statuses.some(
//         (s) =>
//           s ===
//           "IN_PROGRESS"
//       )
//     ) {
//       taskStatus =
//         "IN_PROGRESS";
//     } else if (
//       statuses.some(
//         (s) =>
//           s ===
//           "SUBMITTED"
//       )
//     ) {
//       taskStatus =
//         "SUBMITTED";
//     } else if (
//       statuses.some(
//         (s) =>
//           s ===
//           "VERIFIED"
//       )
//     ) {
//       taskStatus =
//         "VERIFIED";
//     }

//     await prisma.task.update({
//       where: {
//         id: assignment.taskId,
//       },

//       data: {
//         status: taskStatus,
//       },
//     });

//     return updated;
//   };

// exports.getTasks = async (user) => {
//   const tasks = await prisma.task.findMany({
//     where: {
//       OR: [
//         { createdById: user.id },
//         { assignments: { some: { userId: user.id } } },
//       ],
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

//           taskGroup: true,
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

//     const completedAssignments = task.assignments.filter(
//       (a) => a.status === "COMPLETED",
//     ).length;

//     const progress =
//       task.assignments.length > 0
//         ? Math.round(
//             task.assignments.reduce((sum, a) => sum + (a.progress || 0), 0) /
//               task.assignments.length,
//           )
//         : 0;

//     task.assignments.forEach((a) => {
//       const emp = {
//         employeeId: a.employee.employeeId,

//         name: a.employee.name,

//         role: a.employee.role,

//         status: a.status,

//         progress: a.progress || 0,

//         submitted: !!a.submission,

//         submittedAt: a.submittedAt,

//         verifiedAt: a.verifiedAt,

//         completedAt: a.completedAt,
//       };

//       if (a.taskGroupId) {
//         if (!groupsMap[a.taskGroupId]) {
//           groupsMap[a.taskGroupId] = {
//             taskGroupId: a.taskGroupId,

//             groupName: a.taskGroup?.name || null,

//             members: [],
//           };
//         }

//         groupsMap[a.taskGroupId].members.push(emp);
//       } else {
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

//       status: task.status,

//       progress,

//       totalEmployees: task.assignments.length,

//       completedAssignments,

//       totalItems: task.items.length,

//       groups: Object.values(groupsMap),

//       individuals,
//     };
//   });
// };




const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE TASK
//
exports.createTask = async (user, body) => {
  //
  // ✅ ONLY ADMIN / HR / MANAGER
  //
  if (!["ADMIN", "HR", "MANAGER"].includes(user.role)) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ MANAGER CAN CREATE TASK ONLY FOR HIMSELF
  //
  // Task creator itself becomes owner of task.
  // HR can create for herself/manager later via assignment.
  //

  const task = await prisma.task.create({
    data: {
      projectName: body.projectName,
      description: body.description || null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      createdById: user.id,
      status: "DRAFT",
    },
  });

  // Return a minimal task object — omit fields we don't want to expose
  return {
    id: task.id,
    projectName: task.projectName,
    description: task.description || null,
    startDate: task.startDate,
    endDate: task.endDate,
    createdById: task.createdById,
    status: task.status,
    createdAt: task.createdAt,
    progress: 0,
  };
};

//
// 🔥 ASSIGN MAIN TASK
//
// RULES:
//
// HR:
// - can assign to MANAGER
// - can assign to herself
//
// MANAGER:
// - can assign ONLY to himself
//
// EMPLOYEE:
// - cannot receive MAIN TASK
// - employees receive TASK ITEMS only
//
exports.assignTask = async (
  user,
  taskId,
  body
) => {
  //
  // ✅ FIND TASK
  //
  const task =
    await prisma.task.findUnique({
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

  // NOTE: normally only the task creator can assign. However,
  // allow a MANAGER to self-assign a task to themselves even if
  // they are not the creator (use-case: manager accepts a task).
  // We'll enforce this more granularly after resolving employee ids.

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
      ERRORS.TASK
        .DUPLICATE_ASSIGNMENT
    );
  }

  //
  // ✅ FIND USERS
  //
  const employees =
    await prisma.user.findMany({
      where: {
        employeeId: {
          in: employeeIds,
        },
      },
    });

  //
  // ✅ VALIDATE USERS
  //
  if (
    employees.length !==
    employeeIds.length
  ) {
    throw new ApiError(
      400,
      ERRORS.TASK
        .EMPLOYEE_NOT_FOUND
    );
  }

  // ✅ AUTHORIZATION: allow only the task creator to assign,
  // except permit a MANAGER to self-assign to themselves
  // (use-case: manager accepts a task). Any other non-creator
  // attempts are denied.
  const isCreator = task.createdById === user.id;
  const isManagerSelfAssign =
    user.role === "MANAGER" &&
    employees.length === 1 &&
    employees[0].id === user.id;

  if (!isCreator && !isManagerSelfAssign) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  //
  // ✅ ROLE-BASED RULES
  //
  employees.forEach((emp) => {
    //
    // 🔥 MANAGER
    //
    if (user.role === "MANAGER") {
      //
      // Manager can assign
      // ONLY to himself
      //
      const allowed =
        emp.id === user.id;

      if (!allowed) {
        throw new ApiError(
          403,
          "Manager can assign main task only to himself"
        );
      }
    }

    //
    // 🔥 HR
    //
    else if (
      user.role === "HR"
    ) {
      //
      // HR can assign ONLY:
      // - MANAGER
      // - herself
      //
      const allowed =
        emp.role ===
          "MANAGER" ||
        emp.id === user.id;

      if (!allowed) {
        throw new ApiError(
          403,
          `HR cannot assign main task to ${emp.role}`
        );
      }
    }

    //
    // 🔥 ADMIN
    //
    else if (
      user.role === "ADMIN"
    ) {
      //
      // Admin can assign to:
      // - HR
      // - MANAGER
      //
      if (
        ![
          "HR",
          "MANAGER",
        ].includes(emp.role)
      ) {
        throw new ApiError(
          403,
          `Admin cannot assign main task to ${emp.role}`
        );
      }
    }

    //
    // ❌ EMPLOYEE CANNOT RECEIVE MAIN TASK
    //
    if (
      emp.role === "EMPLOYEE"
    ) {
      throw new ApiError(
        403,
        "Employees cannot receive main tasks. Create task items for employees."
      );
    }
  });

  //
  // ✅ CREATE ASSIGNMENTS
  //
  const assignments =
    body.assignments.map(
      (a) => {
        const emp =
          employees.find(
            (e) =>
              e.employeeId ===
              a.employeeId
          );

        return {
          taskId: task.id,

          userId: emp.id,

          workDate: a.workDate
            ? new Date(a.workDate)
            : task.startDate
            ? new Date(task.startDate)
            : new Date(),
        };
      }
    );

  await prisma.taskAssignment.createMany(
    {
      data: assignments,

      skipDuplicates: true,
    }
  );

  //
  // ✅ UPDATE TASK STATUS
  //
  await prisma.task.update({
    where: {
      id: taskId,
    },

    data: {
      status: "ASSIGNED",
    },
  });

  //
  // ✅ SEND NOTIFICATIONS
  //
  await prisma.notification.createMany(
    {
      data: employees.map(
        (emp) => ({
          userId: emp.id,

          title:
            "New Main Task Assigned",

          message: `You have been assigned main task: ${task.projectName}`,

          type:
            "TASK_ASSIGNED",

          level: "INFO",

          entityId: task.id,
        })
      ),
    }
  );

  return {
    success: true,

    message:
      "Main task assigned successfully",
  };
};

//
// 🔥 GET SINGLE TASK
//
exports.getTaskById = async (
  user,
  taskId
) => {
  const task =
    await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
          },
        },

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
    throw new ApiError(
      404,
      ERRORS.TASK.NOT_FOUND
    );
  }

  //
  // ✅ ACCESS RULES
  //
  const isCreator =
    task.createdById === user.id;

  const isAdmin =
    user.role === "ADMIN";

  const assignment =
    await prisma.taskAssignment.findFirst(
      {
        where: {
          taskId: task.id,

          userId: user.id,
        },
      }
    );

  const isAssigned =
    !!assignment;

  if (
    !isCreator &&
    !isAssigned &&
    !isAdmin
  ) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  return task;
};

//
// 🔥 GET MY ASSIGNED TASKS
//
exports.getMyAssignedTasks =
  async (user) => {
    const whereClause = {
      userId: user.id,
    };

    //
    // ✅ MANAGER
    // show tasks assigned by HR
    //
    if (
      user.role ===
      "MANAGER"
    ) {
      whereClause.task = {
        createdBy: {
          role: "HR",
        },
      };
    }

    //
    // ✅ HR
    // show tasks assigned by ADMIN
    //
    if (
      user.role === "HR"
    ) {
      whereClause.task = {
        createdBy: {
          role: "ADMIN",
        },
      };
    }

    const assignments =
      await prisma.taskAssignment.findMany(
        {
          where: whereClause,

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
        }
      );

    return assignments.map(
      (a) => ({
        assignmentId: a.id,

        status: a.status,

        progress:
          a.progress || 0,

        submitted:
          !!a.submission,

        startedAt:
          a.startedAt,

        submittedAt:
          a.submittedAt,

        verifiedAt:
          a.verifiedAt,

        completedAt:
          a.completedAt,

        rejectedAt:
          a.rejectedAt,

        rejectionReason:
          a.rejectionReason,

        taskGroup:
          a.taskGroup
            ? {
                id:
                  a.taskGroup.id,

                name:
                  a.taskGroup
                    .name,
              }
            : null,

        task: {
          id: a.task.id,

          title:
            a.task.title,

          description:
            a.task.description,

          instructions:
            a.task
              .instructions,

          referenceLink:
            a.task
              .referenceLink,

          date: a.task.date,

          location:
            a.task.location,

          setupType:
            a.task
              .setupType,

          status:
            a.task.status,

          totalItems:
            a.task.items
              .length,

          createdBy:
            a.task
              .createdBy,
        },
      })
    );
  };

//
// 🔥 UPDATE TASK ASSIGNMENT STATUS
//
exports.updateTaskAssignmentStatus =
  async (
    user,
    assignmentId,
    body
  ) => {
    const assignment =
      await prisma.taskAssignment.findUnique(
        {
          where: {
            id: assignmentId,
          },

          include: {
            task: true,
          },
        }
      );

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    //
    // ✅ ONLY ASSIGNED USER
    //
    if (
      assignment.userId !==
      user.id
    ) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    const updateData = {
      status: body.status,
    };

    //
    // ✅ PROGRESS
    //
    if (
      body.progress !==
      undefined
    ) {
      updateData.progress =
        body.progress;
    }

    //
    // ✅ STATUS LOGIC
    //
    if (
      body.status ===
      "IN_PROGRESS"
    ) {
      updateData.startedAt =
        new Date();
    }

    if (
      body.status ===
      "SUBMITTED"
    ) {
      updateData.submittedAt =
        new Date();

      updateData.progress = 100;
    }

    if (
      body.status ===
      "VERIFIED"
    ) {
      updateData.verifiedAt =
        new Date();
    }

    if (
      body.status ===
      "COMPLETED"
    ) {
      updateData.completedAt =
        new Date();

      updateData.progress = 100;
    }

    if (
      body.status ===
      "REJECTED"
    ) {
      updateData.rejectedAt =
        new Date();

      updateData.rejectionReason =
        body.rejectionReason ||
        null;
    }

    //
    // ✅ UPDATE ASSIGNMENT
    //
    const updated =
      await prisma.taskAssignment.update(
        {
          where: {
            id: assignmentId,
          },

          data: updateData,
        }
      );

    //
    // ✅ UPDATE MAIN TASK STATUS
    //
    const allAssignments =
      await prisma.taskAssignment.findMany(
        {
          where: {
            taskId:
              assignment.taskId,
          },
        }
      );

    const statuses =
      allAssignments.map(
        (a) => a.status
      );

    let taskStatus =
      "PENDING";

    if (
      statuses.every(
        (s) =>
          s ===
          "COMPLETED"
      )
    ) {
      taskStatus =
        "COMPLETED";
    } else if (
      statuses.some(
        (s) =>
          s ===
          "IN_PROGRESS"
      )
    ) {
      taskStatus =
        "IN_PROGRESS";
    } else if (
      statuses.some(
        (s) =>
          s ===
          "SUBMITTED"
      )
    ) {
      taskStatus =
        "SUBMITTED";
    } else if (
      statuses.some(
        (s) =>
          s ===
          "VERIFIED"
      )
    ) {
      taskStatus =
        "VERIFIED";
    }

    await prisma.task.update({
      where: {
        id: assignment.taskId,
      },

      data: {
        status: taskStatus,
      },
    });

    return updated;
  };

//
// 🔥 GET ALL TASKS
//
exports.getTasks = async (
  user
) => {
  const tasks =
    await prisma.task.findMany({
      where: {
        OR: [
          {
            createdById:
              user.id,
          },

          {
            assignments: {
              some: {
                userId:
                  user.id,
              },
            },
          },
        ],
      },

      include: {
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
          },
        },

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
          },
        },

        items: true,
      },

      orderBy: {
        startDate: "asc",
      },
    });

  return tasks.map((task) => ({
    id: task.id,
    projectName: task.projectName,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    status: task.status,
    createdAt: task.createdAt,
    createdBy: task.createdBy,
    assignments: task.assignments.map((a) => ({
      userId: a.userId,
      employee: a.employee,
      status: a.status,
      progress: a.progress || 0,
    })),
    totalItems: task.items.length,
  }));
};