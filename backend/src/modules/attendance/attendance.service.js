const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

// const getToday = () => {
//   const now = new Date();
//   return new Date(now.setHours(0, 0, 0, 0));
// };

const getToday = () => {
  const now = new Date();

  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  istDate.setHours(0, 0, 0, 0);
  return istDate;
};

// 🔹 START WORK
// exports.startWork = async (userId) => {
//   const today = getToday();

//   let attendance = await prisma.attendance.findUnique({
//     where: { userId_date: { userId, date: today } },
//   });

//   if (attendance?.startTime) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.ALREADY_STARTED);
//   }

//   if (!attendance) {
//     return prisma.attendance.create({
//       data: {
//         userId,
//         date: today,
//         startTime: new Date(),
//         status: "PRESENT",
//       },
//     });
//   }

//   return prisma.attendance.update({
//     where: { id: attendance.id },
//     data: {
//       startTime: new Date(),
//       status: "PRESENT",
//     },
//   });
// };

exports.startWork = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (attendance?.endTime) {
    throw new ApiError(400, "Work already completed for today");
  }

  if (attendance?.startTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.ALREADY_STARTED);
  }

  if (!attendance) {
    return prisma.attendance.create({
      data: {
        userId,
        date: today,
        startTime: new Date(),
        status: "PRESENT",
      },
    });
  }

  return prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      startTime: new Date(),
      status: "PRESENT",
    },
  });
};

// 🔹 STOP WORK
// exports.stopWork = async (userId) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: { userId_date: { userId, date: today } },
//     include: { breaks: true },
//   });

//   if (!attendance || !attendance.startTime) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
//   }

//   const endTime = new Date();

//   let totalHours =
//     (endTime - attendance.startTime) / (1000 * 60 * 60);

//   let breakHours = 0;

//   attendance.breaks.forEach((b) => {
//     if (b.endTime) {
//       breakHours += (b.endTime - b.startTime) / (1000 * 60 * 60);
//     }
//   });

//   totalHours -= breakHours;

//   const status = totalHours < 5 ? "HALF_DAY" : "PRESENT";

//   return prisma.attendance.update({
//     where: { id: attendance.id },
//     data: {
//       endTime,
//       totalHours,
//       breakHours,
//       status,
//     },
//   });
// };

// exports.stopWork = async (userId) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: { userId_date: { userId, date: today } },
//     include: { breaks: true },
//   });

//   if (!attendance || !attendance.startTime) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
//   }

//   if (attendance.endTime) {
//     throw new ApiError(400, "Work already stopped");
//   }

//   // ❌ prevent stop if break active
//   const activeBreak = attendance.breaks.find((b) => !b.endTime);
//   if (activeBreak) {
//     throw new ApiError(400, "End break before stopping work");
//   }

//   const endTime = new Date();

//   let totalHours =
//     (endTime - attendance.startTime) / (1000 * 60 * 60);

//   let breakHours = 0;

//   attendance.breaks.forEach((b) => {
//     breakHours += (b.endTime - b.startTime) / (1000 * 60 * 60);
//   });

//   totalHours -= breakHours;

//   const status =
//     totalHours < 4
//       ? "ABSENT"
//       : totalHours < 7
//       ? "HALF_DAY"
//       : "PRESENT";

//   return prisma.attendance.update({
//     where: { id: attendance.id },
//     data: {
//       endTime,
//       totalHours,
//       breakHours,
//       status,
//     },
//   });
// };

exports.stopWork = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
  }

  if (attendance.endTime) {
    throw new ApiError(400, "Work already stopped");
  }

  // ❌ prevent stop if break active
  const activeBreak = attendance.breaks.find((b) => !b.endTime);
  if (activeBreak) {
    throw new ApiError(400, "End break before stopping work");
  }

  const endTime = new Date();

  let totalHours =
    (endTime - attendance.startTime) / (1000 * 60 * 60);

  let breakHours = 0;

  attendance.breaks.forEach((b) => {
    if (b.endTime) {
      breakHours += (b.endTime - b.startTime) / (1000 * 60 * 60);
    }
  });

  totalHours = Math.max(0, totalHours - breakHours);

  // 🔥 FINAL STATUS LOGIC (GOOD)
  let status = "ABSENT";

  if (totalHours >= 7) status = "PRESENT";
  else if (totalHours >= 4) status = "HALF_DAY";

  return prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      endTime,
      totalHours,
      breakHours,
      status,
    },
  });
};

// 🔹 START BREAK
// exports.startBreak = async (userId) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: { userId_date: { userId, date: today } },
//     include: { breaks: true },
//   });

//   if (!attendance || !attendance.startTime) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
//   }

//   const activeBreak = attendance.breaks.find((b) => !b.endTime);

//   if (activeBreak) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.BREAK_ACTIVE);
//   }

//   return prisma.break.create({
//     data: {
//       attendanceId: attendance.id,
//       startTime: new Date(),
//     },
//   });
// };

exports.startBreak = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
  }

  if (attendance.endTime) {
    throw new ApiError(400, "Work already ended");
  }

  const activeBreak = attendance.breaks.find((b) => !b.endTime);

  if (activeBreak) {
    throw new ApiError(400, ERRORS.ATTENDANCE.BREAK_ACTIVE);
  }

  return prisma.break.create({
    data: {
      attendanceId: attendance.id,
      startTime: new Date(),
    },
  });
};

// 🔹 END BREAK
// exports.endBreak = async (userId) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: { userId_date: { userId, date: today } },
//     include: { breaks: true },
//   });

//   if (!attendance) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
//   }

//   const activeBreak = attendance.breaks.find((b) => !b.endTime);

//   if (!activeBreak) {
//     throw new ApiError(400, ERRORS.ATTENDANCE.NO_ACTIVE_BREAK);
//   }

//   return prisma.break.update({
//     where: { id: activeBreak.id },
//     data: {
//       endTime: new Date(),
//     },
//   });
// };

exports.endBreak = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || attendance.endTime) {
    throw new ApiError(400, "Invalid attendance state");
  }

  const activeBreak = attendance.breaks.find((b) => !b.endTime);

  if (!activeBreak) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NO_ACTIVE_BREAK);
  }

  return prisma.break.update({
    where: { id: activeBreak.id },
    data: {
      endTime: new Date(),
    },
  });
};

// 🔹 GET TODAY ATTENDANCE
exports.getTodayAttendance = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    include: {
      breaks: true,
    },
  });

  if (!attendance) {
    return null;
  }

  return attendance;
};

// 🔹 GET ATTENDANCE HISTORY
exports.getAttendanceHistory = async (userId, query) => {
  const { from, to } = query;

  const where = {
    userId,
  };

  if (from && to) {
    where.date = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  const records = await prisma.attendance.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      breaks: true,
    },
  });

  return records;
};

// 🔹 GET ATTENDANCE SUMMARY
// exports.getAttendanceSummary = async (userId) => {
//   const records = await prisma.attendance.findMany({
//     where: { userId },
//   });

//   let present = 0;
//   let halfDay = 0;
//   let absent = 0;
//   let holiday = 0;

//   records.forEach((r) => {
//     if (r.status === "PRESENT") present++;
//     else if (r.status === "HALF_DAY") halfDay++;
//     else if (r.status === "ABSENT") absent++;
//     else if (r.status === "HOLIDAY") holiday++;
//   });

//   return {
//     totalDays: records.length,
//     present,
//     halfDay,
//     absent,
//     holiday,
//   };
// };

exports.getAttendanceSummary = async (userId) => {
  const records = await prisma.attendance.findMany({
    where: { userId },
  });

  let present = 0;
  let halfDay = 0;
  let absent = 0;
  let holiday = 0;
  let totalHours = 0;

  records.forEach((r) => {
    totalHours += r.totalHours || 0;

    if (r.status === "PRESENT") present++;
    else if (r.status === "HALF_DAY") halfDay++;
    else if (r.status === "ABSENT") absent++;
    else if (r.status === "HOLIDAY") holiday++;
  });

  return {
    totalDays: records.length,
    present,
    halfDay,
    absent,
    holiday,
    totalHours,
    avgHours: records.length
      ? totalHours / records.length
      : 0,
  };
};


// Hr Attandance
exports.getAllAttendance = async (query) => {
  const { from, to, department, status } = query;

  const where = {};

  // Date filter
  if (from && to) {
    where.date = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  // Status filter
  if (status) {
    where.status = status;
  }

  return prisma.attendance.findMany({
    where,
    include: {
      user: {
        select: {
          employeeId: true,
          name: true,
          department: true,
          position: true,
        },
      },
      breaks: true,
    },
    orderBy: { date: "desc" },
  });
};


// Hr Attandace for one Employee

exports.getEmployeeAttendance = async (employeeId, query) => {
  const { from, to } = query;

  const user = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!user) {
    throw new ApiError(404, "Employee not found");
  }

  const where = {
    userId: user.id,
  };

  if (from && to) {
    where.date = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: { breaks: true },
    orderBy: { date: "desc" },
  });

  return {
    employee: {
      name: user.name,
      employeeId: user.employeeId,
      department: user.department,
      position: user.position,
    },
    records,
  };
};


// Hr Dashboard attandance
// exports.getAttendanceDashboard = async () => {
//   const today = getToday();

//   const records = await prisma.attendance.findMany({
//     where: { date: today },
//   });

//   let present = 0;
//   let halfDay = 0;
//   let absent = 0;

//   records.forEach((r) => {
//     if (r.status === "PRESENT") present++;
//     else if (r.status === "HALF_DAY") halfDay++;
//     else if (r.status === "ABSENT") absent++;
//   });

//   return {
//     totalEmployees: records.length,
//     present,
//     halfDay,
//     absent,
//   };
// };

exports.getAttendanceDashboard = async () => {
  // 🔹 total employees
  const totalEmployees = await prisma.user.count({
    where: { role: "EMPLOYEE" },
  });

  // 🔹 today date (IMPORTANT same logic as attendance)
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  // 🔹 today's attendance
  const todayAttendance = await prisma.attendance.findMany({
    where: { date: today },
  });

  let present = 0;
  let halfDay = 0;
  let absent = 0;

  todayAttendance.forEach((a) => {
    if (a.status === "PRESENT") present++;
    else if (a.status === "HALF_DAY") halfDay++;
    else if (a.status === "ABSENT") absent++;
  });

  return {
    totalEmployees,
    present,
    halfDay,
    absent,
  };
};