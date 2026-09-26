const attendanceService = require("./attendance.service");
const service = require("./attendance.service");

// 🔹 START WORK
exports.startWork = async (req, res, next) => {
  try {
    const data = await attendanceService.startWork(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Work started successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 STOP WORK
exports.stopWork = async (req, res, next) => {
  try {
    const data = await attendanceService.stopWork(req.user);

    return res.status(200).json({
      success: true,
      message: "Work stopped successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 START BREAK
exports.startBreak = async (req, res, next) => {
  try {
    const data = await attendanceService.startBreak(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Break started",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 END BREAK
exports.endBreak = async (req, res, next) => {
  try {
    const data = await attendanceService.endBreak(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Break ended",
      data,
    });
  } catch (error) {
    next(error);
  }
};


// 🔹 GET TODAY
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.getTodayAttendance(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Today's attendance fetched",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET HISTORY
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const data = await attendanceService.getAttendanceHistory(
      req.user.id,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Attendance history fetched",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET SUMMARY
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const data = await attendanceService.getAttendanceSummary(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Attendance summary fetched",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Hr Attendance (paginated)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const result = await service.getAllAttendance(req.query);

    res.json({
      success: true,
      message: "All attendance fetched",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// Hr attandance of one employee

exports.getEmployeeAttendance = async (req, res, next) => {
  try {
    const data = await service.getEmployeeAttendance(
      req.params.employeeId,
      req.query
    );

    res.json({
      success: true,
      message: "Employee attendance fetched",
      data,
    });
  } catch (err) {
    next(err);
  }
};


// Hr attandance dashboard
exports.getAttendanceDashboard = async (req, res, next) => {
  try {
    const data = await service.getAttendanceDashboard();

    res.json({
      success: true,
      message: "Dashboard fetched",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// Sidebar Appeals
exports.appealSidebarAccess = async (req, res, next) => {
  try {
    const data = await attendanceService.appealSidebarAccess(req.user.id, req.body.reason);
    return res.status(200).json({ success: true, message: "Appeal submitted successfully", data });
  } catch (error) { next(error); }
};

exports.getPendingAppeals = async (req, res, next) => {
  try {
    const data = await attendanceService.getPendingAppeals();
    return res.status(200).json({ success: true, message: "Pending appeals fetched", data });
  } catch (error) { next(error); }
};

exports.approveSidebarAppeal = async (req, res, next) => {
  try {
    const data = await attendanceService.approveSidebarAppeal(req.params.attendanceId);
    return res.status(200).json({ success: true, message: "Appeal approved", data });
  } catch (error) { next(error); }
};

exports.rejectSidebarAppeal = async (req, res, next) => {
  try {
    const data = await attendanceService.rejectSidebarAppeal(req.params.attendanceId);
    return res.status(200).json({ success: true, message: "Appeal rejected", data });
  } catch (error) { next(error); }
};

