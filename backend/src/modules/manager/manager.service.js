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
      ...(body.department && {
        department: {
          connectOrCreate: {
            where: { name: body.department },
            create: { name: body.department },
          },
        },
      }),
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
    data: {
      ...body,
      ...(body.department && {
        department: {
          connectOrCreate: {
            where: { name: body.department },
            create: { name: body.department },
          },
        },
      }),
    },
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

exports.getMyEmployees =
  async (user) => {

    const employees =
      await prisma.user.findMany({
        where: {
          managerId: user.id,

          role: "EMPLOYEE",
        },

        select: {
          id: true,

          employeeId: true,

          name: true,

          email: true,

          department: true,

          position: true,
        },

        orderBy: {
          name: "asc",
        },
      });

    return employees;
  };

//
// 🔥 GET MANAGER DASHBOARD STATS
//
exports.getDashboardStats = async (user) => {
  // Get all tasks (created by manager OR assigned to manager)
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { createdById: user.id },
        {
          assignments: {
            some: { userId: user.id },
          },
        },
      ],
    },
    include: {
      assignments: true,
    },
  });

  // Count tasks by status
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "COMPLETED"
  ).length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const draftTasks = tasks.filter(
    (t) => t.status === "DRAFT"
  ).length;

  // Get employees under this manager
  const employees = await prisma.user.findMany({
    where: {
      managerId: user.id,
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
    },
  });

  // For each employee, count their task assignments by status
  const employeeStats = await Promise.all(
    employees.map(async (emp) => {
      const assignments = await prisma.taskAssignment.findMany({
        where: { userId: emp.id },
        include: { task: true },
      });

      return {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        totalTasksAssigned: assignments.length,
        completedTasksCount: assignments.filter(
          (a) => a.task.status === "COMPLETED"
        ).length,
        inProgressTasksCount: assignments.filter(
          (a) => a.task.status === "IN_PROGRESS"
        ).length,
        draftTasksCount: assignments.filter(
          (a) => a.task.status === "DRAFT"
        ).length,
      };
    })
  );

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    draftTasks,
    totalEmployees: employees.length,
    employees: employeeStats,
  };
};