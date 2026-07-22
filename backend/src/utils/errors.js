module.exports = {
  AUTH: {
    INVALID_CREDENTIALS: {
      code: "AUTH_001",
      message: "Invalid email or password. Please check and try again."
    },
    UNAUTHORIZED: {
      code: "AUTH_002",
      message: "You are not authorized to access this resource."
    },
    TOKEN_EXPIRED: {
      code: "AUTH_003",
      message: "Your session has expired. Please login again."
    },
    TOKEN_INVALID: {
      code: "AUTH_004",
      message: "Invalid token. Please login again."
    },
    ACCESS_DENIED: {
      code: "AUTH_005",
      message: "Access denied. Insufficient permissions for this operation."
    },
    HR_ONLY: {
      code: "AUTH_006",
      message: "Access denied. This operation is restricted to HR personnel only."
    }
  },

  USER: {
    NOT_FOUND: {
      code: "USER_001",
      message: "User not found. Please verify the user ID."
    },
    DUPLICATE_EMAIL: {
      code: "USER_002",
      message: "This email is already registered. Please use a different email."
    },
    INVALID_ROLE: {
      code: "USER_003",
      message: "Invalid user role. Please select a valid role."
    }
  },

  HR: {
    MANAGER_NOT_FOUND: {
      code: "HR_001",
      message: "Manager not found. Please verify the manager ID."
    },
    EMPLOYEE_NOT_FOUND: {
      code: "HR_002",
      message: "Employee not found. Please verify the employee ID."
    },
    INVALID_USER_TYPE: {
      code: "HR_003",
      message: "Invalid user type. The selected user is not a manager."
    },
    CANNOT_DELETE_ACTIVE_USER: {
      code: "HR_004",
      message: "Cannot delete user with active tasks or pending leaves."
    }
  },

  ATTENDANCE: {
    ALREADY_STARTED: {
      code: "ATT_001",
      message: "You have already started work today. Please end the current session first."
    },
    NOT_STARTED: {
      code: "ATT_002",
      message: "Work not started. Please start work before stopping."
    },
    BREAK_ACTIVE: {
      code: "ATT_003",
      message: "Break is currently active. Please end the break before stopping work."
    },
    NO_ACTIVE_BREAK: {
      code: "ATT_004",
      message: "No active break found. Please start a break first."
    },
    WORK_ALREADY_STOPPED: {
      code: "ATT_005",
      message: "Work has already been stopped for today."
    },
    INVALID_STATE: {
      code: "ATT_006",
      message: "Invalid attendance state. Please refresh and try again."
    },
    WORK_COMPLETED: {
      code: "ATT_007",
      message: "Work already completed for today."
    }
  },

  LEAVE: {
    INVALID_DATES: {
      code: "LEAVE_001",
      message: "Invalid leave dates. End date cannot be before start date."
    },
    PAST_DATES: {
      code: "LEAVE_002",
      message: "Cannot apply leave for past dates. Please select future dates."
    },
    ALREADY_APPLIED: {
      code: "LEAVE_003",
      message: "Leave already applied for the selected dates. Please check your leave history."
    },
    INSUFFICIENT_BALANCE: {
      code: "LEAVE_004",
      message: "Insufficient leave balance. You do not have enough leaves for this period."
    },
    INVALID_TYPE: {
      code: "LEAVE_005",
      message: "Invalid leave type. Please select CASUAL or SICK leave."
    },
    NOT_FOUND: {
      code: "LEAVE_006",
      message: "Leave request not found. Please verify the leave ID."
    },
    ALREADY_PROCESSED: {
      code: "LEAVE_007",
      message: "This leave has already been processed. Cannot modify."
    },
    REJECTION_REASON_REQUIRED: {
      code: "LEAVE_008",
      message: "Please provide a reason for rejecting this leave."
    },
    MONTHLY_LIMIT_EXCEEDED: {
      code: "LEAVE_009",
      message: "Monthly casual leave limit exceeded. Only 1 casual leave allowed per month."
    },
    INVALID_STATUS: {
      code: "LEAVE_010",
      message: "Invalid status provided for leave update."
    }
  },

  TASK: {
    NOT_FOUND: {
      code: "TASK_001",
      message: "Task not found. Please verify the task ID."
    },
    NOT_ASSIGNED: {
      code: "TASK_002",
      message: "This task is not assigned to you."
    },
    ALREADY_SUBMITTED: {
      code: "TASK_003",
      message: "This task has already been submitted."
    },
    INVALID_SUBMISSION: {
      code: "TASK_004",
      message: "Invalid submission data. Please provide valid numbers."
    },
    NO_ASSIGNED_TASKS: {
      code: "TASK_005",
      message: "No tasks assigned to you at this time."
    },
    INVALID_SETUP_TYPE: {
      code: "TASK_006",
      message: "Invalid setup type. Please select PREMIUM, VERY_PREMIUM, or PHONE."
    },
    DUPLICATE_ASSIGNMENT: {
      code: "TASK_007",
      message: "Duplicate employees in assignment. Each employee can only be assigned once."
    },
    EMPLOYEE_NOT_FOUND: {
      code: "TASK_008",
      message: "One or more employees selected for assignment were not found."
    },
    ASSIGNMENT_NOT_FOUND: {
      code: "TASK_009",
      message: "Task assignment not found. Please verify the assignment ID."
    }
  },

  VALIDATION: {
    INVALID_INPUT: {
      code: "VAL_001",
      message: "Invalid input provided. Please check all required fields."
    },
    MISSING_REQUIRED_FIELD: {
      code: "VAL_002",
      message: "Missing required field. Please fill in all required fields."
    },
    INVALID_EMAIL_FORMAT: {
      code: "VAL_003",
      message: "Invalid email format. Please enter a valid email address."
    },
    PASSWORD_TOO_SHORT: {
      code: "VAL_004",
      message: "Password must be at least 6 characters long."
    },
    INVALID_DATE_FORMAT: {
      code: "VAL_005",
      message: "Invalid date format. Please use YYYY-MM-DD format."
    }
  },

  SERVER: {
    INTERNAL_ERROR: {
      code: "SVR_001",
      message: "An unexpected error occurred. Please try again later."
    },
    DATABASE_ERROR: {
      code: "SVR_002",
      message: "Database error. Please try again later."
    },
    SERVICE_UNAVAILABLE: {
      code: "SVR_003",
      message: "Service temporarily unavailable. Please try again later."
    }
  },

  PAYSLIP: {
    NOT_FOUND: {
      code: "PAY_001",
      message: "Payslip not found."
    },
    IMAGE_REQUIRED: {
      code: "PAY_002",
      message: "Payslip image file is required."
    },
    EMPLOYEE_REQUIRED: {
      code: "PAY_003",
      message: "Target employee (userId) is required."
    },
    INVALID_MONTH: {
      code: "PAY_004",
      message: "Invalid month. Month must be between 1 and 12."
    },
    INVALID_YEAR: {
      code: "PAY_005",
      message: "Invalid year. Year must be a valid 4-digit number."
    }
  }

};