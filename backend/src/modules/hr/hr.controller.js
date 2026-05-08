const service = require("./hr.service");

// 🔹 Manager Controllers
exports.createManager = async (req, res, next) => {
  try {
    const data = await service.createManager(req.user, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getManagers = async (req, res, next) => {
  try {
    const data = await service.getManagers(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getManager = async (req, res, next) => {
  try {
    const data = await service.getManager(req.params.employeeId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateManager = async (req, res, next) => {
  try {
    const data = await service.updateManager(req.params.employeeId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteManager = async (req, res, next) => {
  try {
    await service.deleteManager(req.params.employeeId);
    res.json({ success: true, message: "Manager deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// 🔹 Employee Controllers
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

exports.getEmployee = async (req, res, next) => {
  try {
    const data = await service.getEmployee(req.params.employeeId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const data = await service.updateEmployee(req.params.employeeId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    await service.deleteEmployee(req.params.employeeId);
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get Employee Attandance

exports.getEmployeeAttendance = async (req, res, next) => {
  try {
    const data = await service.getEmployeeAttendance(
      req.params.employeeId,
      req.query
    );

    res.json({
      success: true,
      message: "Employee attendance fetched",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// Get Employee Summary

exports.getEmployeeAttendanceSummary = async (req, res, next) => {
  try {
    const data = await service.getEmployeeAttendanceSummary(
      req.params.employeeId
    );

    res.json({
      success: true,
      message: "Employee attendance summary fetched",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 GET ALL LEAVES
exports.getAllLeaves = async (req, res, next) => {
  try {
    const data = await service.getAllLeaves();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 APPROVE / REJECT LEAVE
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const data = await service.updateLeaveStatus(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      message: "Leave updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 EMPLOYEE LEAVE SUMMARY
exports.getEmployeeLeaveSummary = async (req, res, next) => {
  try {
    const data = await service.getEmployeeLeaveSummary(
      req.params.employeeId
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};