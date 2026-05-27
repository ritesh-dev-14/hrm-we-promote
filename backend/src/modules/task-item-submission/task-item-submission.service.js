// const prisma = require("../../config/prisma");

// exports.submitTaskItem = async (
//   user,
//   assignmentId,
//   body
// ) => {

//   await prisma.taskItemSubmission.create({
//     data: {
//       assignmentId,

//       driveLink: body.driveLink,

//       remarks: body.remarks,
//     }
//   });

//   await prisma.taskItemAssignment.update({
//     where: {
//       id: assignmentId
//     },

//     data: {
//       status: "SUBMITTED",

//       submittedAt: new Date()
//     }
//   });

//   return {
//     success: true
//   };
// };

// exports.verifySubmission = async (
//   user,
//   submissionId
// ) => {

//   await prisma.taskItemSubmission.update({
//     where: {
//       id: submissionId
//     },

//     data: {
//       verifiedByManager: true
//     }
//   });

//   return {
//     success: true
//   };
// };




























// const prisma = require("../../config/prisma");

// const ApiError = require("../../utils/ApiError");

// const ERRORS = require("../../utils/errors");

// // 🔥 GET MY ASSIGNED ITEMS
// exports.getMyAssignedItems =
//   async (user) => {

//     const items =
//       await prisma.taskItemAssignment.findMany({
//         where: {
//           userId: user.id,
//         },

//         include: {
//           taskItem: {
//             include: {
//               task: true,
//             },
//           },

//           submission: true,
//         },

//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//     return items;
//   };

// // 🔥 SUBMIT TASK ITEM
// exports.submitTaskItem =
//   async (
//     user,
//     assignmentId,
//     body
//   ) => {

//     // 🔥 FIND ASSIGNMENT
//     const assignment =
//       await prisma.taskItemAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           taskItem: true,

//           submission: true,
//         },
//       });

//     // 🔥 VALIDATE
//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     // 🔥 ONLY ASSIGNED EMPLOYEE
//     if (
//       assignment.userId !== user.id
//     ) {
//       throw new ApiError(
//         403,
//         ERRORS.AUTH.ACCESS_DENIED
//       );
//     }

//     // 🔥 PREVENT DUPLICATE SUBMISSION
//     if (assignment.submission) {
//       throw new ApiError(
//         400,
//         "Task already submitted"
//       );
//     }

//     // 🔥 CREATE SUBMISSION
//     const submission =
//       await prisma.taskItemSubmission.create({
//         data: {
//           assignmentId,

//           driveLink:
//             body.driveLink,

//           remarks:
//             body.remarks ||
//             null,
//         },
//       });

//     // 🔥 UPDATE ASSIGNMENT STATUS
//     await prisma.taskItemAssignment.update({
//       where: {
//         id: assignmentId,
//       },

//       data: {
//         status: "SUBMITTED",

//         submittedAt:
//           new Date(),
//       },
//     });

//     // 🔥 UPDATE ITEM STATUS
//     await prisma.taskItem.update({
//       where: {
//         id: assignment.taskItemId,
//       },

//       data: {
//         status: "SUBMITTED",
//       },
//     });

//     return submission;
//   };

// // 🔥 VERIFY SUBMISSION
// exports.verifySubmission =
//   async (
//     user,
//     assignmentId
//   ) => {

//     // 🔥 ONLY ADMIN / HR / MANAGER
//     if (
//       ![
//         "ADMIN",
//         "HR",
//         "MANAGER",
//       ].includes(user.role)
//     ) {
//       throw new ApiError(
//         403,
//         ERRORS.AUTH.ACCESS_DENIED
//       );
//     }

//     // 🔥 FIND ASSIGNMENT
//     const assignment =
//       await prisma.taskItemAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           submission: true,
//         },
//       });

//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     if (!assignment.submission) {
//       throw new ApiError(
//         400,
//         "Submission not found"
//       );
//     }

//     // 🔥 VERIFY
//     await prisma.taskItemSubmission.update({
//       where: {
//         assignmentId,
//       },

//       data: {
//         verifiedByManager:
//           true,
//       },
//     });

//     // 🔥 UPDATE STATUS
//     await prisma.taskItemAssignment.update({
//       where: {
//         id: assignmentId,
//       },

//       data: {
//         status: "APPROVED",
//       },
//     });

//     await prisma.taskItem.update({
//       where: {
//         id: assignment.taskItemId,
//       },

//       data: {
//         status: "VERIFIED",
//       },
//     });

//     return {
//       success: true,
//       message:
//         "Submission verified successfully",
//     };
//   };


















// const prisma = require("../../config/prisma");

// const ApiError = require("../../utils/ApiError");

// const ERRORS = require("../../utils/errors");

// //
// // 🔥 GET MY ASSIGNED ITEMS
// //
// exports.getMyAssignedItems =
//   async (user) => {

//     const items =
//       await prisma.taskItemAssignment.findMany({
//         where: {
//           userId: user.id,
//         },

//         include: {
//           taskItem: {
//             include: {
//               task: {
//                 include: {
//                   createdBy: {
//                     select: {
//                       id: true,
//                       employeeId: true,
//                       name: true,
//                       role: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },

//           submission: true,
//         },

//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//     return items.map((a) => ({
//       assignmentId: a.id,

//       status: a.status,

//       progress: a.progress || 0,

//       startedAt: a.startedAt,

//       submittedAt: a.submittedAt,

//       completedAt: a.completedAt,

//       verifiedAt: a.verifiedAt,

//       rejectedAt: a.rejectedAt,

//       rejectionReason:
//         a.rejectionReason,

//       submission: a.submission,

//       taskItem: {
//         id: a.taskItem.id,

//         title: a.taskItem.title,

//         description:
//           a.taskItem.description,

//         theme: a.taskItem.theme,

//         instructions:
//           a.taskItem.instructions,

//         status: a.taskItem.status,

//         task: {
//           id: a.taskItem.task.id,

//           title:
//             a.taskItem.task.title,

//           createdBy:
//             a.taskItem.task.createdBy,
//         },
//       },
//     }));
//   };


// //
// // 🔥 SUBMIT TASK ITEM
// //
// exports.submitTaskItem =
//   async (
//     user,
//     assignmentId,
//     body
//   ) => {

//     //
//     // ✅ FIND ASSIGNMENT
//     //
//     const assignment =
//       await prisma.taskItemAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           taskItem: true,

//           submission: true,
//         },
//       });

//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     //
//     // ✅ ONLY ASSIGNED EMPLOYEE
//     //
//     if (
//       assignment.userId !== user.id
//     ) {
//       throw new ApiError(
//         403,
//         ERRORS.AUTH.ACCESS_DENIED
//       );
//     }

//     //
//     // ✅ PREVENT DUPLICATE
//     //
//     if (assignment.submission) {
//       throw new ApiError(
//         400,
//         "Task already submitted"
//       );
//     }

//     //
//     // ✅ CREATE SUBMISSION
//     //
//     const submission =
//       await prisma.taskItemSubmission.create({
//         data: {
//           assignmentId,

//           driveLink:
//             body.driveLink,

//           remarks:
//             body.remarks ||
//             null,
//         },
//       });

//     //
//     // ✅ UPDATE ASSIGNMENT
//     //
//     await prisma.taskItemAssignment.update({
//       where: {
//         id: assignmentId,
//       },

//       data: {
//         status: "SUBMITTED",

//         progress: 100,

//         submittedAt:
//           new Date(),
//       },
//     });

//     //
//     // ✅ UPDATE ITEM STATUS
//     //
//     await updateTaskItemStatus(
//       assignment.taskItemId
//     );

//     return submission;
//   };


// //
// // 🔥 VERIFY SUBMISSION
// //
// exports.verifySubmission =
//   async (
//     user,
//     assignmentId
//   ) => {

//     //
//     // ✅ FIND ASSIGNMENT
//     //
//     const assignment =
//       await prisma.taskItemAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           taskItem: {
//             include: {
//               task: true,
//             },
//           },

//           submission: true,
//         },
//       });

//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     if (!assignment.submission) {
//       throw new ApiError(
//         400,
//         "Submission not found"
//       );
//     }

//     //
//     // ✅ ACCESS CONTROL
//     //
//     let allowed = false;

//     // ADMIN
//     if (user.role === "ADMIN") {
//       allowed = true;
//     }

//     // HR who created task
//     else if (
//       user.role === "HR" &&
//       assignment.taskItem.task.createdById === user.id
//     ) {
//       allowed = true;
//     }

//     // MANAGER assigned task
//     else if (
//       user.role === "MANAGER"
//     ) {

//       const taskAssignment =
//         await prisma.taskAssignment.findFirst({
//           where: {
//             taskId:
//               assignment.taskItem.taskId,

//             userId: user.id,
//           },
//         });

//       if (taskAssignment) {
//         allowed = true;
//       }
//     }

//     if (!allowed) {
//       throw new ApiError(
//         403,
//         ERRORS.AUTH.ACCESS_DENIED
//       );
//     }

//     //
//     // ✅ VERIFY SUBMISSION
//     //
//     await prisma.taskItemSubmission.update({
//       where: {
//         assignmentId,
//       },

//       data: {
//         verifiedByManager:
//           true,
//       },
//     });

//     //
//     // ✅ UPDATE ASSIGNMENT
//     //
//     await prisma.taskItemAssignment.update({
//       where: {
//         id: assignmentId,
//       },

//       data: {
//         status: "COMPLETED",

//         verifiedAt:
//           new Date(),

//         completedAt:
//           new Date(),
//       },
//     });

//     //
//     // ✅ UPDATE ITEM STATUS
//     //
//     await updateTaskItemStatus(
//       assignment.taskItemId
//     );

//     return {
//       success: true,

//       message:
//         "Submission verified successfully",
//     };
//   };


// //
// // 🔥 REJECT SUBMISSION
// //
// exports.rejectSubmission =
//   async (
//     user,
//     assignmentId,
//     body
//   ) => {

//     const assignment =
//       await prisma.taskItemAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           taskItem: {
//             include: {
//               task: true,
//             },
//           },
//         },
//       });

//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     //
//     // ✅ UPDATE STATUS
//     //
//     await prisma.taskItemAssignment.update({
//       where: {
//         id: assignmentId,
//       },

//       data: {
//         status: "REJECTED",

//         rejectedAt:
//           new Date(),

//         rejectionReason:
//           body.rejectionReason ||
//           null,
//       },
//     });

//     //
//     // ✅ UPDATE ITEM STATUS
//     //
//     await updateTaskItemStatus(
//       assignment.taskItemId
//     );

//     return {
//       success: true,

//       message:
//         "Submission rejected",
//     };
//   };


// //
// // 🔥 UPDATE MAIN ITEM STATUS
// //
// const updateTaskItemStatus =
//   async (taskItemId) => {

//     const assignments =
//       await prisma.taskItemAssignment.findMany({
//         where: {
//           taskItemId,
//         },
//       });

//     const statuses =
//       assignments.map(
//         (a) => a.status
//       );

//     let status = "PENDING";

//     if (
//       statuses.every(
//         (s) =>
//           s === "COMPLETED"
//       )
//     ) {
//       status = "COMPLETED";
//     }

//     else if (
//       statuses.some(
//         (s) =>
//           s === "IN_PROGRESS"
//       )
//     ) {
//       status = "IN_PROGRESS";
//     }

//     else if (
//       statuses.some(
//         (s) =>
//           s === "SUBMITTED"
//       )
//     ) {
//       status = "SUBMITTED";
//     }

//     else if (
//       statuses.some(
//         (s) =>
//           s === "REJECTED"
//       )
//     ) {
//       status = "REJECTED";
//     }

//     await prisma.taskItem.update({
//       where: {
//         id: taskItemId,
//       },

//       data: {
//         status,
//       },
//     });
//   };


//   //
// // 🔥 UPDATE ITEM PROGRESS
// //
// exports.updateItemProgress =
//   async (
//     user,
//     assignmentId,
//     body
//   ) => {

//     //
//     // ✅ FIND ASSIGNMENT
//     //
//     const assignment =
//       await prisma.taskItemAssignment.findUnique({
//         where: {
//           id: assignmentId,
//         },

//         include: {
//           taskItem: true,
//         },
//       });

//     if (!assignment) {
//       throw new ApiError(
//         404,
//         "Assignment not found"
//       );
//     }

//     //
//     // ✅ ONLY ASSIGNED EMPLOYEE
//     //
//     if (
//       assignment.userId !== user.id
//     ) {
//       throw new ApiError(
//         403,
//         ERRORS.AUTH.ACCESS_DENIED
//       );
//     }

//     //
//     // ✅ DETERMINE STATUS
//     //
//     let status = "PENDING";

//     if (body.progress > 0) {
//       status = "IN_PROGRESS";
//     }

//     if (body.progress >= 100) {
//       status = "COMPLETED";
//     }

//     //
//     // ✅ UPDATE ASSIGNMENT
//     //
//     const updated =
//       await prisma.taskItemAssignment.update({
//         where: {
//           id: assignmentId,
//         },

//         data: {
//           progress: body.progress,

//           status,

//           startedAt:
//             body.progress > 0
//               ? assignment.startedAt ||
//                 new Date()
//               : null,

//           completedAt:
//             body.progress >= 100
//               ? new Date()
//               : null,
//         },
//       });

//     //
//     // ✅ GET ALL ITEM ASSIGNMENTS
//     //
//     const allAssignments =
//       await prisma.taskItemAssignment.findMany({
//         where: {
//           taskItemId:
//             assignment.taskItemId,
//         },
//       });

//     //
//     // ✅ CALCULATE ITEM PROGRESS
//     //
//     const avgProgress =
//       Math.round(
//         allAssignments.reduce(
//           (sum, a) =>
//             sum + a.progress,
//           0
//         ) / allAssignments.length
//       );

//     //
//     // ✅ ITEM STATUS
//     //
//     let itemStatus =
//       "PENDING";

//     if (
//       avgProgress > 0
//     ) {
//       itemStatus =
//         "IN_PROGRESS";
//     }

//     if (
//       avgProgress >= 100
//     ) {
//       itemStatus =
//         "COMPLETED";
//     }

//     //
//     // ✅ UPDATE ITEM
//     //
//     await prisma.taskItem.update({
//       where: {
//         id: assignment.taskItemId,
//       },

//       data: {
//         progress: avgProgress,

//         status: itemStatus,
//       },
//     });

//     return updated;
//   };









// src/modules/task-item-submission/task-item-submission.service.js

const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");

//
// ======================================================
// 🔥 GET MY ASSIGNED ITEMS
// ======================================================
//
exports.getMyAssignedItems =
  async (user) => {

    const items =
      await prisma.taskItemAssignment.findMany({
        where: {
          userId: user.id,
        },

        include: {
          taskItem: {
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
                },
              },
            },
          },

          submission: {
            select: {
              id: true,
              driveLink: true,
              remarks: true,
              submittedAt: true,
              verifiedByManager: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return items.map((a) => ({
      assignmentId: a.id,

      status: a.status,

      progress: a.progress || 0,

      startedAt: a.startedAt,

      submittedAt: a.submittedAt,

      completedAt: a.completedAt,

      verifiedAt: a.verifiedAt,

      rejectedAt: a.rejectedAt,

      rejectionReason:
        a.rejectionReason,

      submission: a.submission,

      taskItem: {
        id: a.taskItem.id,

        title: a.taskItem.title,

        description:
          a.taskItem.description,

        theme:
          a.taskItem.theme,

        instructions:
          a.taskItem.instructions,

        status:
          a.taskItem.status,

        progress:
          a.taskItem.progress,

        task: {
          id: a.taskItem.task.id,

          title:
            a.taskItem.task.title,

          createdBy:
            a.taskItem.task.createdBy,
        },
      },
    }));
  };

//
// ======================================================
// 🔥 UPDATE ITEM PROGRESS
// ======================================================
//
exports.updateItemProgress =
  async (
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
          taskItem: true,
        },
      });

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    //
    // ✅ ONLY ASSIGNED EMPLOYEE
    //
    if (
      assignment.userId !== user.id
    ) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    //
    // ✅ PREVENT UPDATE AFTER VERIFIED
    //
    if (
      assignment.status ===
      "VERIFIED"
    ) {
      throw new ApiError(
        400,
        "Task already verified"
      );
    }

    //
    // ✅ DETERMINE STATUS
    //
    let status = "PENDING";

    if (
      body.progress === 0
    ) {
      status = "PENDING";
    }

    else if (
      body.progress > 0 &&
      body.progress < 100
    ) {
      status =
        "IN_PROGRESS";
    }

    else if (
      body.progress === 100
    ) {
      status =
        "COMPLETED";
    }

    //
    // ✅ UPDATE ASSIGNMENT
    //
    const updated =
      await prisma.taskItemAssignment.update({
        where: {
          id: assignmentId,
        },

        data: {
          progress:
            body.progress,

          status,

          startedAt:
            body.progress > 0
              ? assignment.startedAt ||
                new Date()
              : null,

          completedAt:
            body.progress === 100
              ? new Date()
              : null,
        },
      });

    //
    // ✅ UPDATE MAIN ITEM
    //
    await recalculateTaskItem(
      assignment.taskItemId
    );

    return updated;
  };

//
// ======================================================
// 🔥 SUBMIT TASK ITEM
// ======================================================
//
exports.submitTaskItem =
  async (
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
          taskItem: true,

          submission: true,
        },
      });

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    //
    // ✅ ONLY EMPLOYEE
    //
    if (
      assignment.userId !== user.id
    ) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    //
    // ✅ MUST COMPLETE FIRST
    //
    if (
      assignment.progress < 100
    ) {
      throw new ApiError(
        400,
        "Complete task before submission"
      );
    }

    //
    // ✅ PREVENT DUPLICATE
    //
    if (assignment.submission) {
      throw new ApiError(
        400,
        "Task already submitted"
      );
    }

    //
    // ✅ CREATE SUBMISSION
    //
    const submission =
      await prisma.taskItemSubmission.create({
        data: {
          assignmentId,

          driveLink:
            body.driveLink || null,

          remarks:
            body.remarks ||
            null,
        },
      });

    //
    // ✅ UPDATE ASSIGNMENT
    //
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status:
          "SUBMITTED",

        submittedAt:
          new Date(),
      },
    });

    //
    // ✅ UPDATE MAIN ITEM
    //
    await recalculateTaskItem(
      assignment.taskItemId
    );

    return submission;
  };

//
// ======================================================
// 🔥 VERIFY SUBMISSION
// ======================================================
//
exports.verifySubmission =
  async (
    user,
    assignmentId
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
          submission: true,

          taskItem: {
            include: {
              task: true,
            },
          },
        },
      });

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    if (!assignment.submission) {
      throw new ApiError(
        400,
        "Submission not found"
      );
    }

    //
    // ✅ ACCESS CONTROL
    //
    let allowed = false;

    //
    // ADMIN
    //
    if (
      user.role === "ADMIN"
    ) {
      allowed = true;
    }

    //
    // HR
    //
    else if (
      user.role === "HR" &&
      assignment.taskItem.task.createdById === user.id
    ) {
      allowed = true;
    }

    //
    // MANAGER
    //
    else if (
      user.role === "MANAGER"
    ) {

      const managerAssignment =
        await prisma.taskAssignment.findFirst({
          where: {
            taskId:
              assignment.taskItem.taskId,

            userId:
              user.id,
          },
        });

      if (
        managerAssignment
      ) {
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
    // ✅ VERIFY
    //
    await prisma.taskItemSubmission.update({
      where: {
        assignmentId,
      },

      data: {
        verifiedByManager:
          true,
      },
    });

    //
    // ✅ UPDATE ASSIGNMENT
    //
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status:
          "VERIFIED",

        verifiedAt:
          new Date(),
      },
    });

    //
    // ✅ UPDATE ITEM
    //
    await recalculateTaskItem(
      assignment.taskItemId
    );

    return {
      success: true,

      message:
        "Submission verified successfully",
    };
  };

//
// ======================================================
// 🔥 REJECT SUBMISSION
// ======================================================
//
exports.rejectSubmission =
  async (
    user,
    assignmentId,
    body
  ) => {

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

          submission: true,
        },
      });

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    if (!assignment.submission) {
      throw new ApiError(
        400,
        "Submission not found"
      );
    }

    //
    // ✅ UPDATE ASSIGNMENT
    //
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status:
          "REJECTED",

        rejectedAt:
          new Date(),

        rejectionReason:
          body.rejectionReason ||
          null,
      },
    });

    //
    // ✅ UPDATE ITEM
    //
    await recalculateTaskItem(
      assignment.taskItemId
    );

    return {
      success: true,

      message:
        "Submission rejected",
    };
  };

//
// ======================================================
// 🔥 RECALCULATE MAIN TASK ITEM
// ======================================================
//
const recalculateTaskItem =
  async (
    taskItemId
  ) => {

    const assignments =
      await prisma.taskItemAssignment.findMany({
        where: {
          taskItemId,
        },
      });

    if (
      !assignments.length
    ) {
      return;
    }

    //
    // ✅ AVERAGE PROGRESS
    //
    const avgProgress =
      Math.round(
        assignments.reduce(
          (sum, a) =>
            sum +
            (a.progress || 0),
          0
        ) /
          assignments.length
      );

    //
    // ✅ DETERMINE STATUS
    //
    const statuses =
      assignments.map(
        (a) => a.status
      );

    let status =
      "PENDING";

    //
    // VERIFIED
    //
    if (
      statuses.every(
        (s) =>
          s === "VERIFIED"
      )
    ) {
      status =
        "VERIFIED";
    }

    //
    // SUBMITTED
    //
    else if (
      statuses.some(
        (s) =>
          s === "SUBMITTED"
      )
    ) {
      status =
        "SUBMITTED";
    }

    //
    // COMPLETED
    //
    else if (
      statuses.every(
        (s) =>
          s === "COMPLETED"
      )
    ) {
      status =
        "COMPLETED";
    }

    //
    // IN_PROGRESS
    //
    else if (
      statuses.some(
        (s) =>
          s ===
          "IN_PROGRESS"
      )
    ) {
      status =
        "IN_PROGRESS";
    }

    //
    // REJECTED
    //
    else if (
      statuses.some(
        (s) =>
          s === "REJECTED"
      )
    ) {
      status =
        "REJECTED";
    }

    //
    // UNABLE_TO_SUBMIT
    //
    else if (
      statuses.some(
        (s) =>
          s === "UNABLE_TO_SUBMIT"
      )
    ) {
      status =
        "UNABLE_TO_SUBMIT";
    }

    //
    // ✅ UPDATE TASK ITEM
    //
    await prisma.taskItem.update({
      where: {
        id: taskItemId,
      },

      data: {
        progress:
          avgProgress,

        status,
      },
    });
  };

//
// ======================================================
// 🔥 UNABLE TO SUBMIT (Employee cannot submit work)
// ======================================================
//
exports.unableToSubmit =
  async (
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
          taskItem: true,

          submission: true,
        },
      });

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    //
    // ✅ ONLY ASSIGNED EMPLOYEE
    //
    if (
      assignment.userId !== user.id
    ) {
      console.log(
        "DEBUG - Assignment userId:",
        assignment.userId,
        "| User id:",
        user.id
      );

      throw new ApiError(
        403,
        "This assignment is not assigned to you"
      );
    }

    //
    // ✅ PREVENT DUPLICATE
    //
    if (assignment.submission) {
      throw new ApiError(
        400,
        "Task already submitted or marked as unable to submit"
      );
    }

    //
    // ✅ UPDATE ASSIGNMENT STATUS
    // Store reason in rejectionReason for backward compatibility
    //
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status:
          "UNABLE_TO_SUBMIT",

        rejectionReason:
          body.reason,

        submittedAt:
          new Date(),
      },
    });

    //
    // ✅ UPDATE MAIN ITEM
    //
    await recalculateTaskItem(
      assignment.taskItemId
    );

    return {
      success: true,
      message:
        "Unable to submit recorded with reason",
      data: {
        assignmentId,
        status: "UNABLE_TO_SUBMIT",
        reason: body.reason,
      },
    };
  };