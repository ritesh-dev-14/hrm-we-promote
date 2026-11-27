const service = require("./manager-incentive.service");

exports.getScoreReport = async (req, res, next) => {
  try {
    const data = await service.getScoreReport(req.user, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
