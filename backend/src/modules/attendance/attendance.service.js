const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const employeeLogoutStatusService = require("../employee/logout-status.service");
const managerService = require("../manager/manager.service");

const getToday = () => {
  const now = new Date();

  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  istDate.setHours(0, 0, 0, 0);
  return istDate;
};

const ensureCanStopWork = async (user) => {
  if (user.role === "EMPLOYEE") {
    const logoutStatus = await employeeLogoutStatusService.getLogoutStatus(user);

    if (!logoutStatus.canLogout) {
      const error = new ApiError(400, ERRORS.ATTENDANCE.PENDING_TASKS);
      error.details = {
        pendingTasks: logoutStatus.pendingTasks,
      };
      throw error;
    }
  }

  if (user.role === "MANAGER") {
    const logoutStatus = await managerService.getManagerLogoutStatus(user);

    if (!logoutStatus.canLogout) {
      const error = new ApiError(400, ERRORS.ATTENDANCE.PENDING_TASKS);
      error.details = {
        pendingEaTasks: logoutStatus.pendingEaTasks,
        pendingMarketingReports: logoutStatus.pendingMarketingReports,
      };
      throw error;
    }
  }
};

exports.startWork = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (attendance?.endTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.WORK_COMPLETED);
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

exports.stopWork = async (user) => {
  const userId = user.id;
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || !attendance.startTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.NOT_STARTED);
  }

  if (attendance.endTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.WORK_ALREADY_STOPPED);
  }

  // ❌ prevent stop if break active
  const activeBreak = attendance.breaks.find((b) => !b.endTime);
  if (activeBreak) {
    throw new ApiError(400, ERRORS.ATTENDANCE.BREAK_ACTIVE);
  }

  await ensureCanStopWork(user);

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

  // 🔥 FINAL STATUS LOGIC
  // PRESENT: > 8 hours
  // HALF_DAY: > 5 hours
  // ABSENT: <= 5 hours
  let status = "ABSENT";

  if (totalHours > 8) status = "PRESENT";
  else if (totalHours > 5) status = "HALF_DAY";

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
    throw new ApiError(400, ERRORS.ATTENDANCE.WORK_COMPLETED);
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



exports.endBreak = async (userId) => {
  const today = getToday();

  const attendance = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { breaks: true },
  });

  if (!attendance || attendance.endTime) {
    throw new ApiError(400, ERRORS.ATTENDANCE.INVALID_STATE);
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


exports.getAttendanceSummary = async (userId) => {
  // 🔥 Single SQL aggregate — no JS-side loop over all rows
  const result = await prisma.$queryRaw`
    SELECT
      COUNT(*)                                         AS "totalDays",
      COUNT(*) FILTER (WHERE status = 'PRESENT')       AS present,
      COUNT(*) FILTER (WHERE status = 'HALF_DAY')      AS "halfDay",
      COUNT(*) FILTER (WHERE status = 'ABSENT')        AS absent,
      COUNT(*) FILTER (WHERE status = 'HOLIDAY')       AS holiday,
      COALESCE(SUM("totalHours"), 0)                   AS "totalHours"
    FROM "Attendance"
    WHERE "userId" = ${userId}
  `;

  const row = result[0];
  const totalDays  = Number(row.totalDays);
  const totalHours = parseFloat(Number(row.totalHours).toFixed(2));

  return {
    totalDays,
    present:   Number(row.present),
    halfDay:   Number(row.halfDay),
    absent:    Number(row.absent),
    holiday:   Number(row.holiday),
    totalHours,
    avgHours: parseFloat((totalDays ? totalHours / totalDays : 0).toFixed(2)),
  };
};


// Hr Attendance (paginated)
exports.getAllAttendance = async (query) => {
  const { from, to, department, status, page = 1, limit = 50 } = query;

  const take = Math.min(Number(limit), 200); // hard cap at 200 rows per page
  const skip = (Math.max(Number(page), 1) - 1) * take;

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

  // Run data + total count in parallel
  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take,
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
    }),
    prisma.attendance.count({ where }),
  ]);

  return {
    data: records,
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};


// Hr Attandace for one Employee

exports.getEmployeeAttendance = async (employeeId, query) => {
  const { from, to } = query;

  const user = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!user) {
    throw new ApiError(404, ERRORS.HR.EMPLOYEE_NOT_FOUND);
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

  todayAttendance.forEach((a) => {
    if (a.status === "PRESENT") present++;
    else if (a.status === "HALF_DAY") halfDay++;
  });

  const absent = Math.max(0, totalEmployees - (present + halfDay));

  return {
    totalEmployees,
    present,
    halfDay,
    absent,
  };
};