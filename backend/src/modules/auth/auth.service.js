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

  // Build a flat array of all departments this user belongs to
  const allDepartments = (user.userDepartments || []).map((ud) => ud.department).filter(Boolean);
  
  // Ensure user.department is always set (fallback to first userDepartment)
  if (!user.department && allDepartments.length > 0) {
    user.department = allDepartments[0];
  }

  // Expose all departments as a clean array for multi-department managers
  user.departments = allDepartments.length > 0 ? allDepartments : (user.department ? [user.department] : []);
  
  // Clean up raw junction data
  delete user.userDepartments;

  return { token, user };
};