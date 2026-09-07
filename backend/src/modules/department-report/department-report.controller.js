const service = require("./department-report.service");

exports.getDepartmentReports = async (req, res, next) => {
  try {
    const data = await service.getDepartmentReports(req.user, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};