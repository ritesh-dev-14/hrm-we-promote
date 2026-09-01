const Joi = require("joi");

exports.createMetaAdsTaskSchema = Joi.object({
  clientName: Joi.string().trim().min(2).max(200).required(),
  monthlyBudget: Joi.number().positive().required(),
  objective: Joi.string().trim().valid("LEAD", "AWARENESS").required(),
  area: Joi.string().trim().min(2).max(200).required(),
  fundsAddedBy: Joi.string().trim().valid("CLIENT", "HARSH_SIR").required(),
}).unknown(false);

exports.updateMetaAdsTaskSchema = Joi.object({
  clientName: Joi.string().trim().min(2).max(200),
  monthlyBudget: Joi.number().positive(),
  objective: Joi.string().trim().valid("LEAD", "AWARENESS"),
  area: Joi.string().trim().min(2).max(200),
  fundsAddedBy: Joi.string().trim().valid("CLIENT", "HARSH_SIR"),
  status: Joi.string().trim().valid("DRAFT", "ASSIGNED", "IN_PROGRESS", "SUBMITTED", "VERIFIED", "REJECTED", "COMPLETED", "OVERDUE", "CANCELLED"),
}).min(1).unknown(false);

exports.assignMetaAdsTaskSchema = Joi.object({
  assignedToId: Joi.string().uuid().required(),
}).unknown(false);
