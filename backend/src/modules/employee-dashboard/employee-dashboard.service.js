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

  // THIS WEEK HOURS
  const startOfWeek = new Date();
  const dayOfWeek = startOfWeek.getDay();
  const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekAttendances = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfWeek,
      },
    },
  });

  const thisWeekHours = thisWeekAttendances.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

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
    thisWeekHours: parseFloat(thisWeekHours.toFixed(1)),
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