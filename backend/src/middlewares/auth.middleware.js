const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const ERRORS = require("../utils/errors");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, ERRORS.AUTH.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    if (!decoded.id && decoded.employeeId) {
      const user = await prisma.user.findUnique({
        where: { employeeId: decoded.employeeId },
      });

      if (!user) {
        return next(new ApiError(401, ERRORS.AUTH.UNAUTHORIZED));
      }

      req.user = {
        id: user.id,
        employeeId: user.employeeId,
        role: user.role,
      };
    } else {
      req.user = decoded;
    }

    next();
  } catch (err) {
    next(new ApiError(401, ERRORS.AUTH.UNAUTHORIZED));
  }
};
