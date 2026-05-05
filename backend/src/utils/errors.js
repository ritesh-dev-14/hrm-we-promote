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