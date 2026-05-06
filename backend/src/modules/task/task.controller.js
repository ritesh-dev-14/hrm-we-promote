const service = require("./task.service");

exports.createTask = async (req, res, next) => {
  try {
    const data = await service.createTask(req.user, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.assignTask = async (req, res, next) => {
  try {
    const data = await service.assignTask(
      req.user,
      req.params.id,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const data = await service.getTasks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};