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
// exports.updateManagerSchema = Joi.object({
//   name: Joi.string().min(3).max(50),
//   email: Joi.string().email(),
//   department: Joi.string().min(2).max(50),
// });

exports.updateManagerSchema =
  Joi.object({
    name: Joi.string(),

    email: Joi.string().email(),

    password: Joi.string().min(6),

    department: Joi.string(),

    position: Joi.string(),

    role: Joi.string().valid(
      "MANAGER",
      "HR",
      "EMPLOYEE"
    ),
  });

// exports.createEmployeeSchema = Joi.object({
//   employeeId: Joi.string().min(3).max(50),

//   name: Joi.string().min(3).max(50).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),

//   role: Joi.string()
//     .valid("ADMIN", "HR", "MANAGER", "EMPLOYEE")
//     .required(),

//   department: Joi.string().min(2).max(50).required(),
//   position: Joi.string().min(2).max(50).required(),

//   managerId: Joi.string().optional(), // 👈 important
// });

exports.createEmployeeSchema = Joi.object({
  employeeId: Joi.string().min(3).max(50),

  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  role: Joi.string()
    .valid("EMPLOYEE") // 🔥 restrict here
    .required(),

  department: Joi.string().min(2).max(50).required(),
  position: Joi.string().min(2).max(50).required(),

  managerId: Joi.string().uuid().optional(), // 🔥 UUID validation
});

// 🔹 Update Employee
// exports.updateEmployeeSchema = Joi.object({
//   name: Joi.string().min(3).max(50),
//   email: Joi.string().email(),
// });

exports.updateEmployeeSchema =
  Joi.object({
    name: Joi.string(),

    email: Joi.string().email(),

    password: Joi.string().min(6),

    department: Joi.string(),

    position: Joi.string(),

    managerId: Joi.string(),

    role: Joi.string().valid(
      "EMPLOYEE",
      "MANAGER",
      "HR"
    ),
  });

exports.updateLeaveSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  reviewNote: Joi.string().allow("", null),
});