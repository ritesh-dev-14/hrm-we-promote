const Joi = require("joi");

exports.submitTaskSchema = Joi.object({
  completedCount: Joi.number().min(0).required(),
  pendingCount: Joi.number().min(0).required(),
  driveLink: Joi.string().uri().required(),
});