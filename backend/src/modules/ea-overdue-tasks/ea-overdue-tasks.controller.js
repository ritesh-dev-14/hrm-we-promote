const ApiError = require("../../utils/ApiError");
const service = require("./ea-overdue-tasks.service");

exports.listOverdueTasks = async (req, res, next) => {
  try {
    const tasks = await service.listOverdueEaTasks();
    res.json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadDigestNotification = async (req, res, next) => {
  try {
    const data = await service.getUnreadDigestNotification(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.markDigestNotificationRead = async (req, res, next) => {
  try {
    const result = await service.markDigestNotificationRead(
      req.user.id,
      req.params.notificationId,
    );
    if (result.count === 0) {
      throw new ApiError(404, "Overdue task notification not found.");
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
