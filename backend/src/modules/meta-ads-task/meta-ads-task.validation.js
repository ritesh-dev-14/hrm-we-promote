const Joi = require("joi");

exports.createMetaAdsTaskSchema = Joi.object({
  projectName: Joi.string().trim().min(2).max(200),
  clientName: Joi.string().trim().min(2).max(200),
  assignedToId: Joi.string().uuid(),
  monthlyBudget: Joi.number().positive().required(),
  objective: Joi.string().trim().valid("LEAD", "AWARENESS", "BOTH").required(),
  area: Joi.string().trim().min(2).max(200).required(),
  fundsAddedBy: Joi.string().trim().valid("CLIENT", "HARSH", "HARSH_SIR").required(),
}).or("projectName", "clientName").unknown(false);

exports.updateMetaAdsTaskSchema = Joi.object({
  projectName: Joi.string().trim().min(2).max(200),
  clientName: Joi.string().trim().min(2).max(200),
  assignedToId: Joi.string().uuid(),
  monthlyBudget: Joi.number().positive(),
  objective: Joi.string().trim().valid("LEAD", "AWARENESS", "BOTH"),
  area: Joi.string().trim().min(2).max(200),
  fundsAddedBy: Joi.string().trim().valid("CLIENT", "HARSH", "HARSH_SIR"),
  status: Joi.string().trim().valid("DRAFT", "ASSIGNED", "IN_PROGRESS", "SUBMITTED", "VERIFIED", "REJECTED", "COMPLETED", "OVERDUE", "CANCELLED"),
}).min(1).unknown(false);

exports.assignMetaAdsTaskSchema = Joi.object({
  assignedToId: Joi.string().uuid().required(),
}).unknown(false);
