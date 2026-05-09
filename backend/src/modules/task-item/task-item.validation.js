// const Joi = require("joi");

// exports.createTaskItemSchema = Joi.object({
//   title: Joi.string().required(),

//   description: Joi.string().allow("", null),

//   theme: Joi.string().allow("", null),

//   referenceLink: Joi.string().allow("", null),

//   instructions: Joi.string().allow("", null),

//   order: Joi.number().optional(),
// });

// exports.assignTaskItemSchema = Joi.object({
//   employeeId: Joi.string().required(),
// });

const Joi = require("joi");

exports.createTaskItemSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(100)
    .required(),

  description: Joi.string()
    .allow("", null),

  theme: Joi.string()
    .allow("", null),

  referenceLink: Joi.string()
    .allow("", null),

  instructions: Joi.string()
    .allow("", null),

  order: Joi.number()
    .optional(),
});

exports.assignTaskItemSchema = Joi.object({
  assignments: Joi.array()
    .items(
      Joi.object({
        employeeId: Joi.string()
          .required(),
      })
    )
    .min(1)
    .required(),
});