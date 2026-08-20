const reportService = require("./report.service");

exports.getEmployeeStats = async (req, res, next) => {
  try {
    const stats = await reportService.getEmployeeStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.getAllEmployeesStats = async (req, res, next) => {
  try {
    const stats = await reportService.getAllEmployeesStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeProjectStats = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const stats = await reportService.getEmployeeProjectStats(employeeId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// ── Projects Overview (Social Media / Meta Ads / SEO) ──────────────────────
exports.getProjectsOverview = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const data = await reportService.getProjectsOverview({ startDate, endDate, type });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
