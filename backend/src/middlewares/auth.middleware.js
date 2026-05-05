const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const ERRORS = require("../utils/errors");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, ERRORS.AUTH.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, ERRORS.AUTH.UNAUTHORIZED));
  }
};
