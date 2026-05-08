const Joi = require("joi");

exports.submitTaskSchema = Joi.object({
  completedCount: Joi.number().min(0).required(),
  pendingCount: Joi.number().min(0).required(),
  driveLink: Joi.string().uri().required(),
});

// exports.applyLeaveSchema = Joi.object({
//   startDate: Joi.date().required(),
//   endDate: Joi.date().required(),
//   reason: Joi.string().min(5).required(),
// });

exports.applyLeaveSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reason: Joi.string().min(5).required(),
  type: Joi.string().valid("CASUAL", "SICK").required(), // 🔥 ADD THIS
});