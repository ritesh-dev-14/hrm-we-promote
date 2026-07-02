const service = require(
  "./department.service"
);

exports.createDepartment =
  async (req, res, next) => {
    try {
      const data =
        await service.createDepartment(
          req.body
        );

      res.status(201).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

exports.getDepartments =
  async (req, res, next) => {
    try {
      const data =
        await service.getDepartments();

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

exports.updateDepartment =
  async (req, res, next) => {
    try {
      const data =
        await service.updateDepartment(
          req.params.id,
          req.body
        );

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

exports.deleteDepartment =
  async (req, res, next) => {
    try {
      const data =
        await service.deleteDepartment(
          req.params.id
        );

      res.status(200).json({
        success: true,
        message:
          "Department deleted successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

//
// 🔥 GET ALL DEPARTMENTS WITH EMPLOYEES
//
exports.getDepartmentsWithEmployees =
  async (req, res, next) => {
    try {
      const data =
        await service.getDepartmentsWithEmployees();

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };