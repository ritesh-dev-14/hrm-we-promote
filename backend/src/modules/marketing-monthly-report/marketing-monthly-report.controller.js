const service = require("./marketing-monthly-report.service");

const handle = (fn) => async (req, res, next) => {
  try { res.json({ success: true, data: await fn(req) }); } catch (err) { next(err); }
};

exports.getMarketingProjects = handle((req) => service.getMarketingProjects(req.user));
exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await service.createMarketingMonthlyReport(req.user, req.body) }); } catch (err) { next(err); }
};
exports.get = handle((req) => service.getMarketingMonthlyReport(req.user, req.query.month, req.query.year));
exports.update = handle((req) => service.updateMarketingMonthlyReport(req.user, req.params.id, req.body));
exports.deleteReport = handle((req) => service.deleteMarketingMonthlyReport(req.user, req.params.id));
exports.updateRow = handle((req) => service.updateMarketingMonthlyReportRow(req.user, req.params.id, req.params.rowId, req.body));
exports.deleteRow = handle((req) => service.deleteMarketingMonthlyReportRow(req.user, req.params.id, req.params.rowId));
exports.addRemark = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await service.addRemark(req.user, req.params.id, req.body) }); } catch (err) { next(err); }
};
exports.deleteRemark = handle((req) => service.deleteRemark(req.user, req.params.remarkId));
