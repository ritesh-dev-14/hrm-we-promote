const Joi = require("joi");

exports.createPendingItemSchema = Joi.object({
  dueDate: Joi.date().iso().required(),
  note: Joi.string().trim().min(1).max(2000).required(),
});

exports.createPendingItemFollowUpSchema = Joi.object({
  status: Joi.string().valid("FOLLOWED_UP", "NOT_FOLLOWED_UP").required(),
  mediaType: Joi.string().valid("VOICE", "SCREENSHOTS").required(),
});
