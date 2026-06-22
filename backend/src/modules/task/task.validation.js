const Joi = require("joi");

//
// 🔥 CREATE TASK VALIDATION
//
exports.createTaskSchema = Joi.object({
  projectName: Joi.string()
    .min(3)
    .max(200)
    .required(),

  description: Joi.string().allow("", null),

  startDate: Joi.date().required(),

  endDate: Joi.date()
    .greater(Joi.ref("startDate"))
    .required(),
}).unknown(false);

//
// 🔥 ASSIGN TASK VALIDATION
//
exports.assignTaskSchema = Joi.object({
  assignments: Joi.array()
    .items(
      Joi.object({
        employeeId: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});

//
// 🔥 UPDATE TASK STATUS
//
exports.updateTaskStatusSchema =
  Joi.object({
    status: Joi.string()
      .valid(
        "PENDING",
        "IN_PROGRESS",
        "SUBMITTED",
        "VERIFIED",
        "COMPLETED",
        "REJECTED"
      )
      .required(),

    progress: Joi.number()
      .min(0)
      .max(100)
      .optional(),

    rejectionReason:
      Joi.string().allow(
        "",
        null
      ),
  });