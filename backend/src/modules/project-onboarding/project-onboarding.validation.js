const Joi = require("joi");

exports.updateChecklistItemSchema = Joi.object({
  completed: Joi.boolean().required(),
});
