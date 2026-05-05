const service = require("./attendance.service");

exports.startWork = async (req, res, next) => {
  try {
    const data = await service.startWork(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.startBreak = async (req, res, next) => {
  try {
    const data = await service.startBreak(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.endBreak = async (req, res, next) => {
  try {
    const data = await service.endBreak(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.stopWork = async (req, res, next) => {
  try {
    const data = await service.stopWork(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};