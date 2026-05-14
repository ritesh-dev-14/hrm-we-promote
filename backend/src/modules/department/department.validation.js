const Joi = require("joi");

exports.departmentSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .required(),
  });