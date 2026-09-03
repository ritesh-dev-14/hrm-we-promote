const Joi = require("joi");

exports.createCampaignSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
}).unknown(false);

exports.updateCampaignSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
}).unknown(false);
