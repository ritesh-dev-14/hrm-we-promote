const Joi = require("joi");

exports.createReportSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  content: Joi.string().min(1).required(),
  date: Joi.date().optional(),
}).unknown(false);
