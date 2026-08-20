const Joi = require('joi');

/**
 * Validation schema for sending manual messages
 */
exports.sendManualMessageSchema = Joi.object({
  projectId: Joi.string().uuid({ version: 'uuidv4' }).required(),
});

/**
 * Validation schema for message filters (query parameters)
 */
exports.messageFiltersSchema = Joi.object({
  projectId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  status: Joi.string().valid('PENDING', 'SENT', 'DELIVERED', 'FAILED').optional(),
  managerId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
  limit: Joi.number().integer().min(1).max(200).default(50).optional(),
  offset: Joi.number().integer().min(0).default(0).optional(),
});

/**
 * Validation schema for getting message by ID
 */
exports.messageIdSchema = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).required(),
});
