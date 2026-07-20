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

// const ERRORS = require("../../utils/errors");
const { incrementUnread } = require("../../services/sidebarUnread.service");

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

const {
  sendSubmissionMailToManager,
  sendApprovalMailToEmployee,
  sendRejectionMailToEmployee,
} = require("../mail/mail.service");


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

        referenceLink:
          a.taskItem.referenceLink,

        rawDataLink:
          a.taskItem.rawDataLink,

        status:
          a.taskItem.status,

        progress:
          a.taskItem.progress,

        task: {
          id: a.taskItem.task.id,

          projectName:
            a.taskItem.task.projectName,

          title:
            a.taskItem.task.title,

          description:
            a.taskItem.task.description,

          status:
            a.taskItem.task.status,

          progress:
            a.taskItem.task.progress,

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
    let status = assignment.status;

    // If the assignment is not already REJECTED, SUBMITTED, etc, auto-update it based on progress
    if (["PENDING", "IN_PROGRESS", "COMPLETED", "ASSIGNED"].includes(status)) {
      if (body.progress === 0) {
        status = "PENDING";
      } else if (body.progress > 0 && body.progress < 100) {
        status = "IN_PROGRESS";
      } else if (body.progress === 100) {
        status = "COMPLETED";
      }
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
        },
      });

    if (!assignment) {
      console.log(
        "DEBUG - Submit: Assignment not found. ID:",
        assignmentId
      );

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
      console.log(
        "DEBUG - Submit: User mismatch. Assignment userId:",
        assignment.userId,
        "| User id:",
        user.id
      );

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
    const existingSubmission =
      await prisma.taskItemSubmission.findUnique({
        where: {
          assignmentId,
        },
      });

    if (existingSubmission) {
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

    // 🔥 Email the manager that employee has submitted (fire-and-forget)
    // Checks task creator first; if creator is HR, finds assigned manager instead
    prisma.taskItem.findUnique({
      where: { id: assignment.taskItemId },
      include: {
        task: {
          include: {
            createdBy: true,
            assignments: { include: { employee: true } },
          },
        },
      },
    }).then(async (taskItem) => {
      if (!taskItem?.task) return;

      const creator = taskItem.task.createdBy;
      const emp = await prisma.user.findUnique({ where: { id: user.id } });

      // If creator is a manager, email them directly
      // Otherwise look for a manager in TaskAssignments (HR-assigned tasks)
      let manager = null;
      if (creator && creator.role === "MANAGER") {
        manager = creator;
      } else {
        const managerAssignment = taskItem.task.assignments.find(
          (a) => a.employee && a.employee.role === "MANAGER"
        );
        manager = managerAssignment?.employee || creator; // fall back to creator (HR)
      }

      if (!manager?.email) return;

      // 🔔 Increment sidebar unread badge for manager (department-aware)
      try {
        let deptName = null;
        if (manager?.departmentId) {
          const dept = await prisma.department.findUnique({
            where: { id: manager.departmentId },
            select: { name: true },
          });
          deptName = dept?.name?.toLowerCase() || null;
        }

        // Fallback: If manager has no department (e.g. Admin/HR), try looking at the project's department
        if (!deptName && taskItem?.task?.projectName) {
          const project = await prisma.project.findFirst({
            where: { projectName: taskItem.task.projectName },
            include: { department: true }
          });
          if (project?.department?.name) {
            deptName = project.department.name.toLowerCase();
          }
        }

        let menuId = "projects";
        if (deptName) {
          if (deptName.includes("content") || deptName.includes("creative")) {
            menuId = "creative";
          } else if (deptName.includes("video") || deptName.includes("editor") || deptName.includes("social media")) {
            menuId = "editor";
          }
        }

        // Fallback 2: Check reference links directly just in case it was created via Editor route
        if (menuId === "projects" && (taskItem?.referenceLink?.includes("/editor") || taskItem?.rawDataLink?.includes("/editor"))) {
          menuId = "editor";
        }

        incrementUnread(manager.id, menuId).catch(() => { });
        
        // Emit toast popup via socket if global io is available
        if (global.io) {
          global.io.to(`user-${manager.id}`).emit("task-submitted-popup", {
            projectName: taskItem.task.projectName || taskItem.task.title,
            employeeName: emp?.name || "Employee",
          });
        }

      } catch (deptErr) {
        console.error("[SidebarUnread] Failed department lookup for submission badge:", deptErr.message);
      }

      return sendSubmissionMailToManager({
        email: manager.email,
        managerName: manager.name,
        employeeName: emp?.name || "Employee",
        taskTitle: taskItem.title,
        remarks: body.remarks || "No additional remarks provided",
        driveLink: body.driveLink || "",
      });
    }).catch((err) =>
      console.error("[Mail] Failed to send submission email to manager:", err.message)
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
    // ✅ FIND ASSIGNMENT OR SUBMISSION
    //
    let assignment = null;
    let submission = null;

    assignment =
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
      submission =
        await prisma.taskItemSubmission.findUnique({
          where: {
            id: assignmentId,
          },
          include: {
            assignment: {
              include: {
                taskItem: {
                  include: {
                    task: true,
                  },
                },
                submission: true,
              },
            },
          },
        });

      assignment = submission?.assignment || null;
    } else {
      submission = assignment.submission;
    }

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment or submission not found"
      );
    }

    if (!submission) {
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
      const isTaskCreator =
        assignment.taskItem.task.createdById === user.id;

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
        isTaskCreator ||
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

    // 🔥 Send approval email to employee (fire-and-forget)
    prisma.user.findUnique({ where: { id: assignment.userId } })
      .then((emp) => {
        if (emp && emp.email) {
          return sendApprovalMailToEmployee({
            email: emp.email,
            employeeName: emp.name,
            taskTitle: assignment.taskItem.title,
          });
        }
      })
      .catch((err) =>
        console.error("[Mail] Failed to send approval email to employee:", err.message)
      );

    return {
      success: true,
      message: "Submission verified successfully",
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
        },
      });

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    //
    // ✅ CHECK SUBMISSION EXISTS
    //
    const submission =
      await prisma.taskItemSubmission.findUnique({
        where: {
          assignmentId,
        },
      });

    if (!submission) {
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

    // 🔥 Send rejection email to employee (fire-and-forget)
    if (global.io) {
      global.io.to(`user-${assignment.userId}`).emit("task-rejected-popup", {
        projectName: assignment.taskItem.task.projectName || "General",
        taskTitle: assignment.taskItem.title,
        reason: body.rejectionReason || "No details provided",
      });
    }
    prisma.user.findUnique({ where: { id: assignment.userId } })
      .then((emp) => {
        if (emp && emp.email) {
          return sendRejectionMailToEmployee({
            email: emp.email,
            employeeName: emp.name,
            taskTitle: assignment.taskItem.title,
            reason: body.rejectionReason || "No details provided",
          });
        }
      })
      .catch((err) =>
        console.error("[Mail] Failed to send rejection email to employee:", err.message)
      );

    return {
      success: true,
      message: "Submission rejected",
    };
  };


//
// ======================================================
// 🔥 RESUBMIT TASK ITEM (after manager rejection)
// ======================================================
//
exports.resubmitTaskItem =
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
        { message: "Assignment not found" }
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
    // ✅ ONLY ALLOW IF REJECTED (or COMPLETED if caught in the previous bug)
    //
    if (
      assignment.status !== "REJECTED" && assignment.status !== "COMPLETED"
    ) {
      throw new ApiError(
        400,
        { message: `Cannot resubmit. Current status is "${assignment.status}". Only rejected assignments can be resubmitted.` }
      );
    }

    //
    // ✅ MUST STILL BE 100% COMPLETE
    //
    console.debug(`[resubmitTaskItem] Check progress. Current progress = ${assignment.progress}`);
    if (assignment.progress < 100) {
      throw new ApiError(
        400,
        { message: "Task progress must be 100% before resubmitting" }
      );
    }

    //
    // ✅ DELETE OLD SUBMISSION (so a fresh one can be created)
    //
    await prisma.taskItemSubmission.deleteMany({
      where: {
        assignmentId,
      },
    });

    //
    // ✅ CREATE NEW SUBMISSION
    //
    const submission =
      await prisma.taskItemSubmission.create({
        data: {
          assignmentId,

          driveLink:
            body.driveLink || null,

          remarks:
            body.remarks || null,
        },
      });

    //
    // ✅ RESET ASSIGNMENT STATUS
    //
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    //
    // ✅ UPDATE MAIN ITEM
    //
    await recalculateTaskItem(
      assignment.taskItemId
    );

    // 🔥 Email the manager about resubmission (fire-and-forget)
    prisma.taskItem.findUnique({
      where: { id: assignment.taskItemId },
      include: {
        task: {
          include: {
            createdBy: true,
            assignments: { include: { employee: true } },
          },
        },
      },
    }).then(async (taskItem) => {
      if (!taskItem?.task) return;

      const creator = taskItem.task.createdBy;
      const emp = await prisma.user.findUnique({ where: { id: user.id } });

      let manager = null;
      if (creator && creator.role === "MANAGER") {
        manager = creator;
      } else {
        const managerAssignment = taskItem.task.assignments.find(
          (a) => a.employee && a.employee.role === "MANAGER"
        );
        manager = managerAssignment?.employee || creator;
      }

      if (!manager?.email) return;

      if (global.io && manager?.id) {
        global.io.to(`user-${manager.id}`).emit("task-resubmitted-popup", {
          projectName: taskItem.task?.projectName || "General",
          taskTitle: taskItem.title,
          employeeName: emp?.name || "Employee",
        });
      }

      return sendSubmissionMailToManager({
        email: manager.email,
        managerName: manager.name,
        employeeName: emp?.name || "Employee",
        taskTitle: taskItem.title,
        remarks: `[RESUBMISSION] ${body.remarks || "Employee has resubmitted after rejection"}`,
        driveLink: body.driveLink || "",
      });
    }).catch((err) =>
      console.error("[Mail] Failed to send resubmission email to manager:", err.message)
    );

    return submission;
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
        },
      });

    if (!assignment) {
      console.log(
        "DEBUG - Assignment not found. ID:",
        assignmentId
      );

      throw new ApiError(
        404,
        "Assignment not found. Please verify the assignment ID."
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
    const existingSubmission =
      await prisma.taskItemSubmission.findUnique({
        where: {
          assignmentId,
        },
      });

    if (existingSubmission) {
      throw new ApiError(
        400,
        "Task already submitted or marked as unable to submit"
      );
    }

    //
    // ✅ CREATE SUBMISSION RECORD
    //
    const submission =
      await prisma.taskItemSubmission.create({
        data: {
          assignmentId,

          unableToSubmitReason:
            body.reason,
        },
      });

    //
    // ✅ UPDATE ASSIGNMENT STATUS
    //
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status:
          "UNABLE_TO_SUBMIT",

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
      submission,
    };
  };