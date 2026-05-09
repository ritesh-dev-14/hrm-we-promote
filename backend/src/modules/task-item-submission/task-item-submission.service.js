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


const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");

// 🔥 GET MY ASSIGNED ITEMS
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
              task: true,
            },
          },

          submission: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return items;
  };

// 🔥 SUBMIT TASK ITEM
exports.submitTaskItem =
  async (
    user,
    assignmentId,
    body
  ) => {

    // 🔥 FIND ASSIGNMENT
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

    // 🔥 VALIDATE
    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    // 🔥 ONLY ASSIGNED EMPLOYEE
    if (
      assignment.userId !== user.id
    ) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    // 🔥 PREVENT DUPLICATE SUBMISSION
    if (assignment.submission) {
      throw new ApiError(
        400,
        "Task already submitted"
      );
    }

    // 🔥 CREATE SUBMISSION
    const submission =
      await prisma.taskItemSubmission.create({
        data: {
          assignmentId,

          driveLink:
            body.driveLink,

          remarks:
            body.remarks ||
            null,
        },
      });

    // 🔥 UPDATE ASSIGNMENT STATUS
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status: "SUBMITTED",

        submittedAt:
          new Date(),
      },
    });

    // 🔥 UPDATE ITEM STATUS
    await prisma.taskItem.update({
      where: {
        id: assignment.taskItemId,
      },

      data: {
        status: "SUBMITTED",
      },
    });

    return submission;
  };

// 🔥 VERIFY SUBMISSION
exports.verifySubmission =
  async (
    user,
    assignmentId
  ) => {

    // 🔥 ONLY ADMIN / HR / MANAGER
    if (
      ![
        "ADMIN",
        "HR",
        "MANAGER",
      ].includes(user.role)
    ) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    // 🔥 FIND ASSIGNMENT
    const assignment =
      await prisma.taskItemAssignment.findUnique({
        where: {
          id: assignmentId,
        },

        include: {
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

    // 🔥 VERIFY
    await prisma.taskItemSubmission.update({
      where: {
        assignmentId,
      },

      data: {
        verifiedByManager:
          true,
      },
    });

    // 🔥 UPDATE STATUS
    await prisma.taskItemAssignment.update({
      where: {
        id: assignmentId,
      },

      data: {
        status: "APPROVED",
      },
    });

    await prisma.taskItem.update({
      where: {
        id: assignment.taskItemId,
      },

      data: {
        status: "VERIFIED",
      },
    });

    return {
      success: true,
      message:
        "Submission verified successfully",
    };
  };