const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

// 🔹 Manager Services
exports.createManager = async (user, body) => {
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
      employeeId: body.employeeId || "MGR-" + Date.now(),
      name: body.name,
      email: body.email,
      password: hashed,
      role: "MANAGER",
      department: body.department,
      createdById: user.id,
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });
};

exports.getManagers = async (user) => {
  return prisma.user.findMany({
    where: {
      role: "MANAGER",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });
};

exports.getManager = async (employeeId) => {
  const manager = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });

  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return manager;
};

exports.updateManager = async (employeeId, body) => {
  const manager = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return prisma.user.update({
    where: { employeeId },
    data: body,
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });
};

exports.deleteManager = async (employeeId) => {
  const manager = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.delete({
    where: { employeeId },
  });
};

exports.createEmployee = async (user, body) => {
  // 🔹 Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  // 🔹 If managerId is provided → validate manager exists
  let manager = null;
  if (body.managerId) {
    manager = await prisma.user.findUnique({
      where: { id: body.managerId },
    });

    if (!manager) {
      throw new ApiError(404, "Manager not found");
    }

    if (manager.role !== "MANAGER") {
      throw new ApiError(400, "Assigned user is not a manager");
    }
  }

  const hashed = await bcrypt.hash(body.password, 10);

  const newUser = await prisma.user.create({
    data: {
      employeeId: body.employeeId || "EMP-" + Date.now(),
      name: body.name,
      email: body.email,
      password: hashed,

      role: body.role,
      department: body.department,
      position: body.position,

      managerId: body.managerId || null, // 👈 NEW
      createdById: user.id,
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      createdAt: true,
    },
  });

  return newUser;
};

exports.getEmployees = async (user) => {
  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      manager: {
        select: {
          name: true
        }
      },
      createdAt: true,
    },
  });
};

exports.getEmployee = async (employeeId) => {
  const employee = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      manager: {
        select: {
          name: true
        }
      },
      createdAt: true,
    },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return employee;
};

exports.updateEmployee = async (employeeId, body) => {
  const employee = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (employee.role !== "EMPLOYEE") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return prisma.user.update({
    where: { employeeId },
    data: body,
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      createdAt: true,
    },
  });
};

exports.deleteEmployee = async (employeeId) => {
  const employee = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.delete({
    where: { employeeId },
  });
};