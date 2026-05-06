const Joi = require("joi");

exports.createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow("", null),
  date: Joi.date().required(),
  location: Joi.string().allow("", null),
  setupType: Joi.string()
    .valid("PREMIUM", "VERY_PREMIUM", "PHONE")
    .required(),
});

exports.assignTaskSchema = Joi.object({
  assignments: Joi.array()
    .items(
      Joi.object({
        employeeId: Joi.string().required(),
        groupId: Joi.string().optional(),
      })
    )
    .min(1)
    .required(),
});