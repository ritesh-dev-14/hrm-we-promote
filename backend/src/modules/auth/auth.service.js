const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

exports.login = async (data) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      department: true,
      userDepartments: {
        include: { department: true }
      }
    }
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

  // Map userDepartments to user.department if necessary
  if (!user.department && user.userDepartments?.length > 0) {
    user.department = user.userDepartments[0].department;
  }
  
  // Clean up userDepartments so it doesn't leak unnecessary data
  delete user.userDepartments;

  return { token, user };
};