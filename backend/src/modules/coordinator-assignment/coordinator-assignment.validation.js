const Joi = require("joi");

//
// 🔥 CREATE COORDINATOR ASSIGNMENT (Inline Task Creation)
//
exports.createAssignmentSchema = Joi.object({
  task: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      "string.min": "Task name must be at least 3 characters",
      "string.max": "Task name cannot exceed 200 characters",
      "any.required": "Task name is required",
    }),

  assignedToId: Joi.string()
    .required()
    .messages({
      "any.required": "Assigned To User ID is required",
    }),

  assignedBy: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.min": "Assigned By must be at least 2 characters",
      "string.max": "Assigned By cannot exceed 100 characters",
      "any.required": "Assigned By (coordinator name) is required",
    }),

  completionDate: Joi.date()
    .required()
    .messages({
      "any.required": "Completion date is required",
    }),

  employeeNumber: Joi.string()
    .required()
    .messages({
      "any.required": "Employee number is required",
    }),

  employeeEmail: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Valid email is required",
      "any.required": "Employee email is required",
    }),
})
  .unknown(false);

//
// 🔥 UPDATE ASSIGNMENT STATUS
//
// Status can be: IN_PROGRESS, SUBMITTED, COMPLETED, UNABLE_TO_SUBMIT, REJECTED
// Reason is required for non-completion statuses
//
exports.updateAssignmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "IN_PROGRESS",
      "SUBMITTED",
      "COMPLETED",
      "UNABLE_TO_SUBMIT",
      "REJECTED"
    )
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Status must be IN_PROGRESS, SUBMITTED, COMPLETED, UNABLE_TO_SUBMIT, or REJECTED",
    }),

  reason: Joi.string()
    .max(500)
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Reason cannot exceed 500 characters",
    }),
})
  .unknown(false);

//
// 🔥 SEND FOLLOW-UP MESSAGE / REPLY
//
exports.sendFollowUpMessageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    "any.required": "Message is required",
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 1000 characters",
  }),
}).unknown(false);

exports.replyFollowUpMessageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    "any.required": "Message is required",
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 1000 characters",
  }),
}).unknown(false);

//
// 🔥 CREATE COORDINATOR TASK (By Any User)
// Employees, HR, Managers can create tasks/requirements for coordinator
//
exports.createCoordinatorTaskSchema = Joi.object({
  taskName: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      "string.min": "Task name must be at least 3 characters",
      "string.max": "Task name cannot exceed 200 characters",
      "any.required": "Task name is required",
    }),

  description: Joi.string()
    .min(5)
    .max(1000)
    .required()
    .messages({
      "string.min": "Description must be at least 5 characters",
      "string.max": "Description cannot exceed 1000 characters",
      "any.required": "Description is required",
    }),

  startDate: Joi.date()
    .required()
    .messages({
      "any.required": "Start date is required",
    }),

  endDate: Joi.date()
    .min(Joi.ref("startDate"))
    .required()
    .messages({
      "any.required": "End date (till date) is required",
      "date.min": "End date must be after or equal to start date",
    }),

  assignedToCoordinatorId: Joi.string()
    .required()
    .messages({
      "any.required": "Coordinator ID is required",
    }),
})
  .unknown(false);
