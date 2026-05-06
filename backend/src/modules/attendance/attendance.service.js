// const prisma = require("../../config/prisma");
// const ApiError = require("../../utils/ApiError");

// const getToday = () => {
//   const now = new Date();
//   return new Date(now.toISOString().split("T")[0]);
// };

// // 🔹 START WORK
// exports.startWork = async (user) => {
//   const today = getToday();

//   const existing = await prisma.attendance.findUnique({
//     where: {
//       userId_date: {
//         userId: user.id,
//         date: today,
//       },
//     },
//   });

//   if (existing && existing.startTime) {
//     throw new ApiError(400, { message: "Already started" });
//   }

//   return prisma.attendance.upsert({
//     where: {
//       userId_date: {
//         userId: user.id,
//         date: today,
//       },
//     },
//     update: {
//       startTime: new Date(),
//       status: "PRESENT",
//     },
//     create: {
//       userId: user.id,
//       date: today,
//       startTime: new Date(),
//       status: "PRESENT",
//     },
//   });
// };

// // 🔹 START BREAK
// exports.startBreak = async (user) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: {
//       userId_date: {
//         userId: user.id,
//         date: today,
//       },
//     },
//   });

//   if (!attendance || !attendance.startTime) {
//     throw new ApiError(400, { message: "Work not started" });
//   }

//   const activeBreak = await prisma.break.findFirst({
//     where: {
//       attendanceId: attendance.id,
//       endTime: null,
//     },
//   });

//   if (activeBreak) {
//     throw new ApiError(400, { message: "Break already active" });
//   }

//   return prisma.break.create({
//     data: {
//       attendanceId: attendance.id,
//       startTime: new Date(),
//     },
//   });
// };

// // 🔹 END BREAK
// exports.endBreak = async (user) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: {
//       userId_date: {
//         userId: user.id,
//         date: today,
//       },
//     },
//   });

//   const activeBreak = await prisma.break.findFirst({
//     where: {
//       attendanceId: attendance.id,
//       endTime: null,
//     },
//   });

//   if (!activeBreak) {
//     throw new ApiError(400, { message: "No active break" });
//   }

//   return prisma.break.update({
//     where: { id: activeBreak.id },
//     data: {
//       endTime: new Date(),
//     },
//   });
// };

// // 🔹 STOP WORK
// exports.stopWork = async (user) => {
//   const today = getToday();

//   const attendance = await prisma.attendance.findUnique({
//     where: {
//       userId_date: {
//         userId: user.id,
//         date: today,
//       },
//     },
//     include: { breaks: true },
//   });

//   if (!attendance || !attendance.startTime) {
//     throw new ApiError(400, { message: "Work not started" });
//   }

//   const endTime = new Date();

//   const totalMs = endTime - attendance.startTime;

//   const breakMs = attendance.breaks.reduce((acc, b) => {
//     if (b.endTime) {
//       return acc + (b.endTime - b.startTime);
//     }
//     return acc;
//   }, 0);

//   const workingMs = totalMs - breakMs;

//   const workingHours = workingMs / (1000 * 60 * 60);
//   const breakHours = breakMs / (1000 * 60 * 60);

//   const status = workingHours < 5 ? "HALF_DAY" : "PRESENT";

//   return prisma.attendance.update({
//     where: { id: attendance.id },
//     data: {
//       endTime,
//       totalHours: workingHours,
//       breakHours,
//       status,
//     },
//   });
// };




const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const getToday = () => {
  const now = new Date();
  return new Date(now.setHours(0, 0, 0, 0));
};

// 🔹 START WORK
exports.startWork = async (userId) => {
  const today = getToday();

  let attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
  });

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
exports.stopWork = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
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

  totalHours -= breakHours;

  const status = totalHours < 5 ? "HALF_DAY" : "PRESENT";

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
exports.startBreak = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
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
exports.endBreak = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
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