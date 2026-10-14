const service = require("./weekly-voice-report.service");

exports.submitReport = async (req, res, next) => {
  try {
    const data = await service.submitReport(req.user, req.body, req.files, req.file);
    res.status(201).json({
      success: true,
      message: "Weekly report submitted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveClients = async (req, res, next) => {
  try {
    const data = await service.getActiveClients(req.user);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const data = await service.getMyReports(req.user, req.query);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReports = async (req, res, next) => {
  try {
    const data = await service.getAllReports(req.query);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getQAMetaAdsTracking = async (req, res, next) => {
  try {
    const data = await service.getQAMetaAdsTracking(req.query);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewReportByQA = async (req, res, next) => {
  try {
    const data = await service.reviewReportByQA(req.params.id, req.user, req.body);
    res.json({
      success: true,
      message: `Report ${req.body.qaStatus?.toLowerCase() || "reviewed"} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};
