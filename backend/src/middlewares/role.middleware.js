const ApiError = require("../utils/ApiError");
const ERRORS = require("../utils/errors");

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      console.warn(`[Role] Access denied — user role: "${userRole}" | allowed: [${allowed.join(", ")}]`);
      return next(new ApiError(403, ERRORS.AUTH.ACCESS_DENIED));
    }
    next();
  };
};
