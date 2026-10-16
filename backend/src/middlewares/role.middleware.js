const ApiError = require("../utils/ApiError");
const ERRORS = require("../utils/errors");

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = (req.user?.roles?.length ? req.user.roles : [req.user?.role])
      .filter(Boolean)
      .map((userRole) => userRole.toUpperCase());
    const allowed = allowedRoles.map((r) => r.toUpperCase());
    if (!allowed.some((allowedRole) => userRoles.includes(allowedRole))) {
      console.warn(`[Role] Access denied — user roles: [${userRoles.join(", ")}] | allowed: [${allowed.join(", ")}]`);
      return next(new ApiError(403, ERRORS.AUTH.ACCESS_DENIED));
    }
    next();
  };
};
