module.exports = {
  AUTH: {
    INVALID_CREDENTIALS: {
      code: "AUTH_001",
      message: "Invalid email or password"
    },
    UNAUTHORIZED: {
      code: "AUTH_002",
      message: "Unauthorized access"
    }
  },

  USER: {
    NOT_FOUND: {
      code: "USER_001",
      message: "User not found"
    },
    DUPLICATE_EMAIL: {
      code: "USER_004",
      message: "Email already exists"
    }
  },

  HR: {
    MANAGER_NOT_FOUND: {
      code: "HR_001",
      message: "Manager not found"
    },
    EMPLOYEE_NOT_FOUND: {
      code: "HR_002",
      message: "Employee not found"
    },
    INVALID_USER_TYPE: {
      code: "HR_003",
      message: "Invalid user type"
    }
  },

  ATTENDANCE: {
    ALREADY_STARTED: {
      code: "ATT_001",
      message: "Attendance already started today"
    },
    NOT_STARTED: {
      code: "ATT_002",
      message: "Attendance not started"
    }
  },

  COMMON: {
    SERVER_ERROR: {
      code: "COM_001",
      message: "Something went wrong"
    }
  }
};