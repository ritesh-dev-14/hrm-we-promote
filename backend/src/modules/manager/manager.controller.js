const service = require("./manager.service");

exports.createEmployee = async (req, res, next) => {
  try {
    const data = await service.createEmployee(req.user, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const data = await service.getEmployees(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const data = await service.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    await service.deleteEmployee(req.params.id);
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getMyEmployees =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.getMyEmployees(
          req.user
        );

      res.json({
        success: true,
        data,
      });

    } catch (err) {
      next(err);
    }
  };

exports.getDashboardStats = async (
  req,
  res,
  next
) => {
  try {
    const data = await service.getDashboardStats(
      req.user
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
