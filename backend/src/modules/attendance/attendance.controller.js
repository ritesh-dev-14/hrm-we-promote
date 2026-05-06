// const service = require("./attendance.service");

// exports.startWork = async (req, res, next) => {
//   try {
//     const data = await service.startWork(req.user);
//     res.json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.startBreak = async (req, res, next) => {
//   try {
//     const data = await service.startBreak(req.user);
//     res.json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.endBreak = async (req, res, next) => {
//   try {
//     const data = await service.endBreak(req.user);
//     res.json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.stopWork = async (req, res, next) => {
//   try {
//     const data = await service.stopWork(req.user);
//     res.json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };


const attendanceService = require("./attendance.service");

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
    const data = await attendanceService.stopWork(req.user.id);

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