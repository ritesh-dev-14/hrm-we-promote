const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const { sendLeaveAppliedMailToHR } = require("../mail/mail.service");

// 🔹 GET ASSIGNED TASKS
exports.getTasks = async (user) => {
  return prisma.taskAssignment.findMany({
    where: {
      userId: user.id,
    },
    include: {
      task: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// 🔹 SUBMIT TASK
exports.submitTask = async (user, assignmentId, body) => {
  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: assignmentId },
    include: { task: true }
  });

  if (!assignment) {
    throw new ApiError(404, ERRORS.TASK.ASSIGNMENT_NOT_FOUND);
  }

  if (assignment.userId !== user.id) {
    throw new ApiError(403, ERRORS.TASK.NOT_ASSIGNED);
  }

  if (assignment.status === "SUBMITTED") {
    throw new ApiError(400, ERRORS.TASK.ALREADY_SUBMITTED);
  }

  if (body.completedCount + body.pendingCount <= 0) {
    throw new ApiError(400, ERRORS.TASK.INVALID_SUBMISSION);
  }

  const submission = await prisma.taskSubmission.create({
    data: {
      assignmentId,
      completedCount: body.completedCount,
      pendingCount: body.pendingCount,
      driveLink: body.driveLink
    }
  });

  await prisma.taskAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "SUBMITTED"
    }
  });

  return submission;
};


// 🔹 APPLY LEAVE
// exports.applyLeave = async (user, body) => {
//   const { startDate, endDate, reason } = body;

//   // ❗ validate dates
//   if (new Date(startDate) > new Date(endDate)) {
//     throw new ApiError(400, "Start date cannot be after end date");
//   }

//   // ❗ prevent overlapping leaves
//   const overlap = await prisma.leave.findFirst({
//     where: {
//       userId: user.id,
//       OR: [
//         {
//           startDate: { lte: new Date(endDate) },
//           endDate: { gte: new Date(startDate) },
//         },
//       ],
//     },
//   });

//   if (overlap) {
//     throw new ApiError(400, "Leave already applied for these dates");
//   }

//   return prisma.leave.create({
//     data: {
//       userId: user.id,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       reason,
//     },
//   });
// };

// exports.applyLeave = async (user, body) => {
//   const { startDate, endDate, reason, type } = body;

//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   if (start > end) {
//     throw new ApiError(400, "Start date cannot be after end date");
//   }

//   // 🔥 calculate days
//   const days =
//     Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

//   // ❗ prevent overlap
//   const overlap = await prisma.leave.findFirst({
//     where: {
//       userId: user.id,
//       startDate: { lte: end },
//       endDate: { gte: start },
//     },
//   });

//   if (overlap) {
//     throw new ApiError(400, "Leave already applied for these dates");
//   }

//   // 🔥 get current year balance
//   const year = start.getFullYear();

//   let balance = await prisma.leaveBalance.findUnique({
//     where: {
//       userId_year: {
//         userId: user.id,
//         year,
//       },
//     },
//   });

//   // auto create if not exists
//   if (!balance) {
//     balance = await prisma.leaveBalance.create({
//       data: {
//         userId: user.id,
//         year,
//       },
//     });
//   }

//   // 🔥 CHECK BALANCE
//   if (type === "CASUAL") {
//     if (balance.casual - balance.usedCasual < days) {
//       throw new ApiError(400, "Not enough casual leaves");
//     }

//     // 🔥 monthly rule (1 casual per month)
//     const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
//     const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);

//     const monthlyLeave = await prisma.leave.count({
//       where: {
//         userId: user.id,
//         type: "CASUAL",
//         startDate: { gte: monthStart, lte: monthEnd },
//         status: { in: ["PENDING", "APPROVED"] },
//       },
//     });

//     if (monthlyLeave >= 1) {
//       throw new ApiError(400, "Only 1 casual leave allowed per month");
//     }
//   }

//   if (type === "SICK") {
//     if (balance.sick - balance.usedSick < days) {
//       throw new ApiError(400, "Not enough sick leaves");
//     }
//   }

//   // 🔥 CREATE LEAVE
//   return prisma.leave.create({
//     data: {
//       userId: user.id,
//       startDate: start,
//       endDate: end,
//       reason,
//       type,
//       days,
//     },
//   });
// };

exports.applyLeave = async (user, body) => {
  const { startDate, endDate, reason, type } = body;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  // 🔥 check probation period
  if (dbUser && dbUser.probationPeriod) {
    throw new ApiError(400, "Cannot apply for leave during probation period");
  }

  // 🔥 validate type
  if (!["CASUAL", "SICK"].includes(type)) {
    throw new ApiError(400, ERRORS.LEAVE.INVALID_TYPE);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // normalize (important)
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    throw new ApiError(400, ERRORS.LEAVE.INVALID_DATES);
  }

  // ❗ prevent past leave
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    throw new ApiError(400, ERRORS.LEAVE.PAST_DATES);
  }

  // 🔥 calculate days
  const days =
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (days > 1) {
    throw new ApiError(400, "You can only apply for 1 day of leave per request.");
  }

  // ❗ prevent overlap (ignore rejected)
  const overlap = await prisma.leave.findFirst({
    where: {
      userId: user.id,
      status: { not: "REJECTED" },
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });

  if (overlap) {
    throw new ApiError(400, ERRORS.LEAVE.ALREADY_APPLIED);
  }

  // 🔥 get balance
  const year = start.getFullYear();

  let balance = await prisma.leaveBalance.findUnique({
    where: {
      userId_year: {
        userId: user.id,
        year,
      },
    },
  });

  if (!balance) {
    balance = await prisma.leaveBalance.create({
      data: {
        userId: user.id,
        year,
      },
    });
  }

  // 🔥 CHECK BALANCE
  if (type === "CASUAL") {
    if (balance.casual - balance.usedCasual < days) {
      throw new ApiError(400, ERRORS.LEAVE.INSUFFICIENT_BALANCE);
    }
  }

  if (type === "SICK") {
    if (balance.sick - balance.usedSick < days) {
      throw new ApiError(400, ERRORS.LEAVE.INSUFFICIENT_BALANCE);
    }
  }

  // 🔥 GLOBAL monthly rule (1 leave per month total)
  const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);

  const monthlyLeave = await prisma.leave.findFirst({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "APPROVED"] },
      // 🔥 overlap with current month
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
  });

  if (monthlyLeave) {
    throw new ApiError(400, "Only 1 leave is allowed per month.");
  }

  // 🔥 CREATE LEAVE
  const leave = await prisma.leave.create({
    data: {
      userId: user.id,
      startDate: start,
      endDate: end,
      reason,
      type,
      days,
    },
  });

  // 🔥 SEND EMAIL TO HR
  try {
    const hrUsers = await prisma.user.findMany({
      where: { role: "HR" },
      select: { email: true }
    });
    
    for (const hr of hrUsers) {
      if (hr.email) {
        await sendLeaveAppliedMailToHR({
          hrEmail: hr.email,
          employeeName: user.name || dbUser.name,
          leaveType: type,
          startDate: start,
          endDate: end,
          reason,
          days
        }).catch(err => console.error("Error sending leave email to HR:", err));
      }
    }
  } catch (err) {
    console.error("Failed to notify HR about leave application", err);
  }

  // 🔥 UPDATE ATTENDANCE IMMEDATELY
  const dates = [];
  let current = new Date(leave.startDate);

  while (current <= new Date(leave.endDate)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  await prisma.$transaction(
    dates.map((date) =>
      prisma.attendance.upsert({
        where: {
          userId_date: {
            userId: leave.userId,
            date,
          },
        },
        update: {
          status: "LEAVE",
        },
        create: {
          userId: leave.userId,
          date,
          status: "LEAVE",
        },
      }),
    ),
  );

  return leave;
};

// 🔹 GET MY LEAVES
// exports.getMyLeaves = async (user) => {
//   return prisma.leave.findMany({
//     where: { userId: user.id },
//     orderBy: { createdAt: "desc" },
//   });
// };

exports.getMyLeaves = async (user) => {
  return prisma.leave.findMany({
    where: { userId: user.id },
    include: {
      reviewer: {
        select: {
          name: true,
          employeeId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

exports.getMyLeaveBalance = async (user) => {
  const year = new Date().getFullYear();

  let balance = await prisma.leaveBalance.findUnique({
    where: {
      userId_year: {
        userId: user.id,
        year,
      },
    },
  });

  // 🔥 auto create if not exists
  if (!balance) {
    balance = await prisma.leaveBalance.create({
      data: {
        userId: user.id,
        year,
      },
    });
  }

  return {
    casualTotal: balance.casual,
    casualUsed: balance.usedCasual,
    casualLeft: balance.casual - balance.usedCasual,

    sickTotal: balance.sick,
    sickUsed: balance.usedSick,
    sickLeft: balance.sick - balance.usedSick,
  };
};