const Joi = require("joi");

//
// 🔥 CREATE TASK ITEM WITH ASSIGNMENT
//
// When manager/HR creates a task item from a task
// and assigns it to a specific employee
//
exports.createTaskItemSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      "string.min": "Title must be at least 2 characters",
      "string.max": "Title cannot exceed 200 characters",
    }),

  employeeId: Joi.string()
    .required()
    .messages({
      "any.required": "Employee ID is required",
    }),

  dueDate: Joi.date()
    .required()
    .messages({
      "any.required": "Due date is required",
    }),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH")
    .optional()
    .default("MEDIUM"),

  description: Joi.string()
    .max(500)
    .allow("", null)
    .optional(),

  status: Joi.string()
    .valid("DRAFT", "IN_PROGRESS")
    .optional()
    .default("DRAFT"),
})
  .unknown(false);

//
// 🔥 UPDATE TASK ITEM STATUS
//
// Employee or manager updates the status
// Status: ASSIGNED, IN_PROGRESS, COMPLETED
//
exports.updateTaskItemStatusSchema = Joi.object({
  status: Joi.string()
    .valid("ASSIGNED", "IN_PROGRESS", "COMPLETED")
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Status must be ASSIGNED, IN_PROGRESS, or COMPLETED",
    }),

  progress: Joi.number()
    .min(0)
    .max(100)
    .optional(),
})
  .unknown(false);

//
// 🔥 ASSIGN TASK ITEM (legacy)
//
exports.assignTaskItemSchema = Joi.object({
  assignments: Joi.array()
    .items(
      Joi.object({
        employeeId: Joi.string()
          .required(),
      })
    )
    .min(1)
    .required(),
});