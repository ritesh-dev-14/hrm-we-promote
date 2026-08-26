class ApiError extends Error {
  constructor(statusCode, error) {
    const normalizedError = typeof error === "string"
      ? { message: error }
      : error || {};

    super(normalizedError.message || "Request failed");
    this.statusCode = statusCode;
    this.code = normalizedError.code;
    this.isOperational = true;
  }
}

module.exports = ApiError;