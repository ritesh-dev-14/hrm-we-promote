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

        status: "COMPLETED",
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

  // THIS MONTH HOURS
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthAttendances = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfMonth,
      },
    },
  });

  const thisMonthHours = thisMonthAttendances.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

  // PERFORMANCE SCORE
  let performanceScore = 0;
  if (assigned > 0) {
    performanceScore = Math.round((completed / assigned) * 100);
  } else {
    performanceScore = 100; // default to 100% if no tasks assigned, or maybe 0%? Let's use 100 if none.
  }

  return {
    assigned,
    completed,
    pending,
    overdue,
    thisMonthHours: parseFloat(thisMonthHours.toFixed(1)),
    performanceScore,
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