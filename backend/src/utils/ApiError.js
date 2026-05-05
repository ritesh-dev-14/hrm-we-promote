class ApiError extends Error {
  constructor(statusCode, error) {
    super(error.message);
    this.statusCode = statusCode;
    this.code = error.code;
  }
}

module.exports = ApiError;