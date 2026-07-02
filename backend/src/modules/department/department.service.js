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

  const projectCount =
    await prisma.project.count({
      where: { departmentId: id },
    });

  if (projectCount > 0) {
    throw new ApiError(
      409,
      "Cannot delete department because it is linked to one or more projects"
    );
  }

  return prisma.department.delete({
    where: { id },
  });
};

//
// 🔥 GET ALL DEPARTMENTS WITH EMPLOYEES
//
// Returns all departments with their employees
// Accessible by: MANAGER, HR, ADMIN
//
exports.getDepartmentsWithEmployees = async () => {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          role: true,
          position: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Format response
  return departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    employeeCount: dept.users.length,
    employees: dept.users,
    createdAt: dept.createdAt,
  }));
};