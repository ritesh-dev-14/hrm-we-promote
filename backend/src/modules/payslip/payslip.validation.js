const Joi = require("joi");

const uploadPayslipSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "Employee ID (userId) is required",
    "string.empty": "Employee ID (userId) cannot be empty",
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    "number.base": "Month must be a number",
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
    "any.required": "Month is required",
  }),
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    "number.base": "Year must be a number",
    "number.min": "Year must be at least 2000",
    "number.max": "Year cannot exceed 2100",
    "any.required": "Year is required",
  }),
  title: Joi.string().allow("", null).optional(),
  remarks: Joi.string().allow("", null).optional(),
  sendEmail: Joi.alternatives().try(Joi.boolean(), Joi.string()).optional(),
});

const getPayslipsSchema = Joi.object({
  userId: Joi.string().optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
  search: Joi.string().allow("", null).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const updatePayslipSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
  title: Joi.string().allow("", null).optional(),
  remarks: Joi.string().allow("", null).optional(),
  sendEmail: Joi.alternatives().try(Joi.boolean(), Joi.string()).optional(),
});

module.exports = {
  uploadPayslipSchema,
  getPayslipsSchema,
  updatePayslipSchema,
};
