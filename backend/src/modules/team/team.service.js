const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");

//
// 🔥 GET EMPLOYEES UNDER LOGGED-IN MANAGER
//
exports.getMyEmployees = async (user) => {
  //
  // ✅ ONLY MANAGER / HR / ADMIN
  //
  if (!["MANAGER", "HR", "ADMIN"].includes(user.role)) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // 🔥 MANAGER
  // only his employees
  //
  if (user.role === "MANAGER") {
    return await prisma.user.findMany({
      where: {
        managerId: user.id,

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
      },

      orderBy: {
        name: "asc",
      },
    });
  }

  //
  // 🔥 HR / ADMIN
  // can see all employees
  //
  return await prisma.user.findMany({
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

      manager: {
        select: {
          id: true,

          employeeId: true,

          name: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });
};

//
// 🔥 GET EMPLOYEES UNDER SPECIFIC MANAGER
//
exports.getEmployeesByManager = async (
  user,
  managerId
) => {
  //
  // ✅ ONLY HR / ADMIN
  //
  if (!["HR", "ADMIN"].includes(user.role)) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ CHECK MANAGER EXISTS
  //
  const manager = await prisma.user.findFirst({
    where: {
      id: managerId,

      role: "MANAGER",
    },
  });

  if (!manager) {
    throw new ApiError(
      404,
      "Manager not found"
    );
  }

  //
  // ✅ GET EMPLOYEES
  //
  return await prisma.user.findMany({
    where: {
      managerId: manager.id,

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
    },

    orderBy: {
      name: "asc",
    },
  });
};