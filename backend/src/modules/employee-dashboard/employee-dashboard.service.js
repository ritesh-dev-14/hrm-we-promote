const prisma = require("../../config/prisma");

exports.getSummary = async (user) => {
  // TOTAL ASSIGNED
  const assigned =
    await prisma.taskItemAssignment.count({
      where: {
        userId: user.id,
      },
    });

  // COMPLETED
  const completed =
    await prisma.taskItemAssignment.count({
      where: {
        userId: user.id,

        status: "APPROVED",
      },
    });

  // PENDING
  const pending =
    await prisma.taskItemAssignment.count({
      where: {
        userId: user.id,

        status: {
          in: ["ASSIGNED", "SUBMITTED"],
        },
      },
    });

  // OVERDUE (for now 0)
  const overdue = 0;

  return {
    assigned,
    completed,
    pending,
    overdue,
  };
};

// 🔥 GET ASSIGNED ITEMS
exports.getAssignedItems = async (user) => {
  return prisma.taskItemAssignment.findMany({
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
};

// 🔥 GET SUBMISSIONS
exports.getSubmissions = async (user) => {
  return prisma.taskItemSubmission.findMany({
    where: {
      assignment: {
        userId: user.id,
      },
    },

    include: {
      assignment: {
        include: {
          taskItem: true,
        },
      },
    },

    orderBy: {
      submittedAt: "desc",
    },
  });
};