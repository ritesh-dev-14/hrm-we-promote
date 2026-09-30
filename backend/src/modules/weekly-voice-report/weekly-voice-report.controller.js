const service = require("./weekly-voice-report.service");

exports.submitReport = async (req, res, next) => {
  try {
    const data = await service.submitReport(req.user, req.body, req.file);
    res.status(201).json({
      success: true,
      message: "Weekly voice report submitted successfully",
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
