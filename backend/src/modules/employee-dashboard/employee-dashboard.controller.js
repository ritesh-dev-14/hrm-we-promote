const service = require("./employee-dashboard.service");

// 🔥 SUMMARY
exports.getSummary = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.getSummary(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 🔥 ASSIGNED ITEMS
exports.getAssignedItems = async (
  req,
  res,
  next
) => {
  try {
    const result = await service.getAssignedItems(
      req.user,
      req.query
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// 🔥 SUBMISSIONS
exports.getSubmissions = async (
  req,
  res,
  next
) => {
  try {
    const result = await service.getSubmissions(
      req.user,
      req.query
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};