const Joi = require("joi");

exports.createReportSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  content: Joi.string().min(1).required(),
  date: Joi.date().optional(),
  lastWorking: Joi.string().max(1000).optional().allow(null, ""),
  lastDiscussion: Joi.string().max(1000).optional().allow(null, ""),
  nextStep: Joi.string().max(1000).optional().allow(null, ""),
  blockers: Joi.string().max(1000).optional().allow(null, ""),
  taskProgress: Joi.number().min(0).max(100).optional().allow(null),
}).unknown(false);
