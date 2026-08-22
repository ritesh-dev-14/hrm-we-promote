const service = require("./seo-task.service");

exports.createSeoTask = async (req, res, next) => {
  try {
    const data = await service.createSeoTask(req.user, req.body || {}, req.file);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getSeoTasks = async (req, res, next) => {
  try {
    const data = await service.getSeoTasks(req.user, req.query.projectId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
