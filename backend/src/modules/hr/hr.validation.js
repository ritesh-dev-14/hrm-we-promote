const Joi = require("joi");

// 🔹 Create Manager
exports.createManagerSchema = Joi.object({
  employeeId: Joi.string().min(3).max(50),
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  department: Joi.alternatives()
    .try(
      Joi.string().min(2).max(50),
      Joi.array().items(Joi.string().min(2).max(50)).min(1)
    )
    .required(),

  departments: Joi.alternatives()
    .try(
      Joi.string().min(2).max(50),
      Joi.array().items(Joi.string().min(2).max(50)).min(1)
    ),

  position: Joi.string().min(2).max(50),
});

exports.updateManagerSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(6),

  department: Joi.alternatives()
    .try(
      Joi.string().min(2).max(50),
      Joi.array().items(Joi.string().min(2).max(50)).min(1)
    ),

  departments: Joi.alternatives()
    .try(
      Joi.string().min(2).max(50),
      Joi.array().items(Joi.string().min(2).max(50)).min(1)
    ),

  position: Joi.string(),

  role: Joi.string().valid("MANAGER", "HR", "EMPLOYEE"),
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
    .valid("EMPLOYEE")
    .required(),

  department: Joi.alternatives()
    .try(
      Joi.string().min(2).max(50),
      Joi.array().items(Joi.string().min(2).max(50)).min(1)
    )
    .required(),

  departments: Joi.alternatives()
    .try(
      Joi.string().min(2).max(50),
      Joi.array().items(Joi.string().min(2).max(50)).min(1)
    ),

  position: Joi.string().min(2).max(50).required(),

  managerId: Joi.alternatives()
    .try(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()).min(1)),

  managerIds: Joi.alternatives()
    .try(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()).min(1)),
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

    department: Joi.alternatives()
      .try(
        Joi.string().min(2).max(50),
        Joi.array().items(Joi.string().min(2).max(50)).min(1)
      ),

    departments: Joi.alternatives()
      .try(
        Joi.string().min(2).max(50),
        Joi.array().items(Joi.string().min(2).max(50)).min(1)
      ),

    position: Joi.string(),

    managerId: Joi.alternatives()
      .try(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()).min(1)),

    managerIds: Joi.alternatives()
      .try(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()).min(1)),

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