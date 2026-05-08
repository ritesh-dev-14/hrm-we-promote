const service = require("./employee.service");

exports.getTasks = async (req, res, next) => {
  try {
    const data = await service.getTasks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.submitTask = async (req, res, next) => {
  try {
    const data = await service.submitTask(
      req.user,
      req.params.id,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 🔹 APPLY LEAVE
exports.applyLeave = async (req, res, next) => {
  try {
    const data = await service.applyLeave(req.user, req.body);

    res.json({
      success: true,
      message: "Leave applied successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 GET MY LEAVES
exports.getMyLeaves = async (req, res, next) => {
  try {
    const data = await service.getMyLeaves(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyLeaveBalance = async (req, res, next) => {
  try {
    const data = await service.getMyLeaveBalance(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};