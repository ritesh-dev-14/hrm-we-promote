// const Joi = require("joi");

// exports.submitSchema = Joi.object({
//   driveLink: Joi.string().required(),

//   remarks: Joi.string()
//     .allow("", null),
// });

const Joi = require("joi");

exports.submitSchema = Joi.object({
  driveLink: Joi.string()
    .required(),

  remarks: Joi.string()
    .allow("", null),
});