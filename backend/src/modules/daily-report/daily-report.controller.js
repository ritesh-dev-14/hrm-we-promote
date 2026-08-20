const dailyReportService = require('./daily-report.service');

/**
 * GET /api/daily-report
 *
 * Query params:
 *   date        - YYYY-MM-DD (default: today)
 *   department  - social_media | seo | marketing | all (default: all)
 *   projectId   - filter to a specific project (optional)
 */
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
