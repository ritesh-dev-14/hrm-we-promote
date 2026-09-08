const ApiError = require("../utils/ApiError");
const ERRORS = require("../utils/errors");

module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: error.details[0].message,
      })
    );
  }

  next();
};
