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


exports.rejectSchema =
  Joi.object({
    rejectionReason:
      Joi.string()
        .required(),
  });

  //
// 🔥 UPDATE PROGRESS
//
exports.updateProgressSchema =
  Joi.object({
    progress: Joi.number()
      .min(0)
      .max(100)
      .required(),
  });