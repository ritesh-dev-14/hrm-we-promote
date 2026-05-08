const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

exports.createEmployee = async (user, body) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  const hashed = await bcrypt.hash(body.password, 10);

  return prisma.user.create({
    data: {
      employeeId: body.employeeId || "EMP-" + Date.now(),
      name: body.name,
      email: body.email,
      password: hashed,
      role: "EMPLOYEE",
      department: body.department,
      position: body.position,
      managerId: user.id,
      createdById: user.id,
    },
  });
};

exports.getEmployees = async (user) => {
  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      managerId: user.id,
    },
  });
};

exports.updateEmployee = async (id, body) => {
  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.update({
    where: { id },
    data: body,
  });
};

exports.deleteEmployee = async (id) => {
  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.delete({
    where: { id },
  });
};