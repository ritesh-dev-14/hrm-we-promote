const { getUnreads, resetUnread } = require("../../services/sidebarUnread.service");

exports.getUnreads = async (req, res, next) => {
  try {
    const data = await getUnreads(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.resetUnread = async (req, res, next) => {
  try {
    const { menuId } = req.body;
    if (!menuId) {
      return res.status(400).json({ success: false, message: "menuId is required" });
    }
    await resetUnread(req.user.id, menuId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
