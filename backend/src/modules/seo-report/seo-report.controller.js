const service = require("./seo-report.service");

exports.createSeoReport = async (req, res, next) => {
  try {
    const data = await service.createSeoReport(req.user, req.body, req.file);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getSeoReports = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId query param is required.",
      });
    }
    const data = await service.getSeoReports(req.user, projectId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getSeoReportById = async (req, res, next) => {
  try {
    const data = await service.getSeoReportById(req.user, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteSeoReport = async (req, res, next) => {
  try {
    const data = await service.deleteSeoReport(req.user, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
