const service = require("./admin-dashboard.service");
const ApiError = require("../../utils/ApiError");

exports.getControlTowerStats = async (req, res, next) => {
  try {
    const stats = await service.getControlTowerStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
