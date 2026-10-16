const Joi = require("joi");

exports.createPendingItemSchema = Joi.object({
  dueDate: Joi.date().iso().required(),
  note: Joi.string().trim().min(1).max(2000).required(),
});
