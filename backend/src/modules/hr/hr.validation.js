const Joi = require("joi");

// 🔹 Create Manager
exports.createManagerSchema = Joi.object({
  employeeId: Joi.string().min(3).max(50),
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  department: Joi.string().min(2).max(50).required(),
});

// 🔹 Update Manager
exports.updateManagerSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  department: Joi.string().min(2).max(50),
});

exports.createEmployeeSchema = Joi.object({
  employeeId: Joi.string().min(3).max(50),

  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  role: Joi.string()
    .valid("ADMIN", "HR", "MANAGER", "EMPLOYEE")
    .required(),

  department: Joi.string().min(2).max(50).required(),
  position: Joi.string().min(2).max(50).required(),

  managerId: Joi.string().optional(), // 👈 important
});

// 🔹 Update Employee
exports.updateEmployeeSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
});

exports.updateLeaveSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  reviewNote: Joi.string().allow("", null),
});