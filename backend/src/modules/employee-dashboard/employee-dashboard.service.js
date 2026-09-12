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

// 🔥 GET ASSIGNED ITEMS (paginated)
exports.getAssignedItems = async (user, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const take = Math.min(Number(limit), 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const where = { userId: user.id };

  const [items, total] = await Promise.all([
    prisma.taskItemAssignment.findMany({
      where,
      skip,
      take,
      include: {
        taskItem: {
          include: {
            task: true,
          },
        },
        submission: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.taskItemAssignment.count({ where }),
  ]);

  return {
    data: items,
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

// 🔥 GET SUBMISSIONS (paginated)
exports.getSubmissions = async (user, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const take = Math.min(Number(limit), 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const where = { assignment: { userId: user.id } };

  const [submissions, total] = await Promise.all([
    prisma.taskItemSubmission.findMany({
      where,
      skip,
      take,
      include: {
        assignment: {
          include: {
            taskItem: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.taskItemSubmission.count({ where }),
  ]);

  return {
    data: submissions,
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};