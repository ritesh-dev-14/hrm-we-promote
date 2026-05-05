const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");

const getToday = () => {
  const now = new Date();
  return new Date(now.toISOString().split("T")[0]);
};

// 🔹 START WORK
exports.startWork = async (user) => {
  const today = getToday();

  const existing = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  if (existing && existing.startTime) {
    throw new ApiError(400, { message: "Already started" });
  }

  return prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      startTime: new Date(),
      status: "PRESENT",
    },
    create: {
      userId: user.id,
      date: today,
      startTime: new Date(),
      status: "PRESENT",
    },
  });
};

// 🔹 START BREAK
exports.startBreak = async (user) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, { message: "Work not started" });
  }

  const activeBreak = await prisma.break.findFirst({
    where: {
      attendanceId: attendance.id,
      endTime: null,
    },
  });

  if (activeBreak) {
    throw new ApiError(400, { message: "Break already active" });
  }

  return prisma.break.create({
    data: {
      attendanceId: attendance.id,
      startTime: new Date(),
    },
  });
};

// 🔹 END BREAK
exports.endBreak = async (user) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  const activeBreak = await prisma.break.findFirst({
    where: {
      attendanceId: attendance.id,
      endTime: null,
    },
  });

  if (!activeBreak) {
    throw new ApiError(400, { message: "No active break" });
  }

  return prisma.break.update({
    where: { id: activeBreak.id },
    data: {
      endTime: new Date(),
    },
  });
};

// 🔹 STOP WORK
exports.stopWork = async (user) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    include: { breaks: true },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, { message: "Work not started" });
  }

  const endTime = new Date();

  const totalMs = endTime - attendance.startTime;

  const breakMs = attendance.breaks.reduce((acc, b) => {
    if (b.endTime) {
      return acc + (b.endTime - b.startTime);
    }
    return acc;
  }, 0);

  const workingMs = totalMs - breakMs;

  const workingHours = workingMs / (1000 * 60 * 60);
  const breakHours = breakMs / (1000 * 60 * 60);

  const status = workingHours < 5 ? "HALF_DAY" : "PRESENT";

  return prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      endTime,
      totalHours: workingHours,
      breakHours,
      status,
    },
  });
};