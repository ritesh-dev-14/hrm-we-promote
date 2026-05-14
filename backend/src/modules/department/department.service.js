const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");

//
// 🔥 CREATE DEPARTMENT
//
exports.createDepartment = async (body) => {
  const existing = await prisma.department.findUnique({
    where: {
      name: body.name,
    },
  });

  if (existing) {
    throw new ApiError(
      400,
      "Department already exists"
    );
  }

  return prisma.department.create({
    data: {
      name: body.name,
    },
  });
};

//
// 🔥 GET ALL DEPARTMENTS
//
exports.getDepartments = async () => {
  return prisma.department.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

//
// 🔥 UPDATE DEPARTMENT
//
exports.updateDepartment = async (
  id,
  body
) => {
  const department =
    await prisma.department.findUnique({
      where: { id },
    });

  if (!department) {
    throw new ApiError(
      404,
      "Department not found"
    );
  }

  return prisma.department.update({
    where: { id },
    data: {
      name: body.name,
    },
  });
};

//
// 🔥 DELETE DEPARTMENT
//
exports.deleteDepartment = async (
  id
) => {
  const department =
    await prisma.department.findUnique({
      where: { id },
    });

  if (!department) {
    throw new ApiError(
      404,
      "Department not found"
    );
  }

  return prisma.department.delete({
    where: { id },
  });
};