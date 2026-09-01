const service = require("./meta-ads-task.service");

exports.createMetaAdsTask = async (req, res, next) => {
  try {
    const data = await service.createMetaAdsTask(req.user, req.body || {});
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMetaAdsTasks = async (req, res, next) => {
  try {
    const data = await service.getMetaAdsTasks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMetaAdsTaskById = async (req, res, next) => {
  try {
    const data = await service.getMetaAdsTaskById(req.user, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.assignMetaAdsTask = async (req, res, next) => {
  try {
    const data = await service.assignMetaAdsTask(req.user, req.params.id, req.body || {});
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.updateMetaAdsTask = async (req, res, next) => {
  try {
    const data = await service.updateMetaAdsTask(req.user, req.params.id, req.body || {});
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
