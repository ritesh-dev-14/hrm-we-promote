const service = require("./marketing-report.service");

exports.createMarketingReport = async (req, res, next) => {
  try {
    const data = await service.createMarketingReport(req.user, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMarketingReports = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId query param is required.",
      });
    }
    const data = await service.getMarketingReports(req.user, projectId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMarketingReportById = async (req, res, next) => {
  try {
    const data = await service.getMarketingReportById(req.user, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateMarketingReport = async (req, res, next) => {
  try {
    const data = await service.updateMarketingReport(req.user, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteMarketingReport = async (req, res, next) => {
  try {
    const data = await service.deleteMarketingReport(req.user, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
