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