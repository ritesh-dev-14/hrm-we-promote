const service = require("./team.service");

//
// 🔥 GET MY EMPLOYEES
//
exports.getMyEmployees = async (
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

//
// 🔥 GET EMPLOYEES BY MANAGER
//
exports.getEmployeesByManager =
  async (req, res, next) => {
    try {
      const data =
        await service.getEmployeesByManager(
          req.user,
          req.params.managerId
        );

      res.json({
        success: true,

        data,
      });
    } catch (err) {
      next(err);
    }
  };