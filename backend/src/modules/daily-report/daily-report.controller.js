const dailyReportService = require('./daily-report.service');


exports.getDailyReport = async (req, res, next) => {
  try {
    const { date, department, projectId } = req.query;

    const report = await dailyReportService.getDailyReport(req.user, {
      date,
      department,
      projectId,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
