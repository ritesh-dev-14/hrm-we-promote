const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

exports.createEmployee = async (user, body) => {
  const hashed = await bcrypt.hash(body.password, 10);

  return prisma.user.create({
    data: {
      employeeId: "EMP-" + Date.now(),
      name: body.name,
      email: body.email,
      password: hashed,
      role: "EMPLOYEE",
      createdById: user.id,
    },
  });
};

exports.getEmployees = async (user) => {
  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      createdById: user.id,
    },
  });
};

exports.updateEmployee = async (id, body) => {
  return prisma.user.update({
    where: { id },
    data: body,
  });
};

exports.deleteEmployee = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};