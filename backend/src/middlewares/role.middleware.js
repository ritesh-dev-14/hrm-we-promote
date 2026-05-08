const ApiError = require("../utils/ApiError");
const ERRORS = require("../utils/errors");

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, ERRORS.AUTH.ACCESS_DENIED));
    }
    next();
  };
};