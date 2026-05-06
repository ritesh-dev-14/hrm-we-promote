const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

exports.login = async (data) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new ApiError(401, ERRORS.AUTH.INVALID_CREDENTIALS);
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    throw new ApiError(401, ERRORS.AUTH.INVALID_CREDENTIALS);
  }

  const token = jwt.sign(
    { id: user.id, employeeId: user.employeeId, role: user.role },
    process.env.JWT_SECRET
  );

  return { token, user };
};