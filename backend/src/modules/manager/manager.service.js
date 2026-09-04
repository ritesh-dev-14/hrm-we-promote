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
      OR: [
        { managerId: user.id },
        {
          employeeManagers: {
            some: { managerId: user.id },
          },
        },
      ],
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
          role: "EMPLOYEE",
          OR: [
            { managerId: user.id },
            {
              employeeManagers: {
                some: { managerId: user.id },
              },
            },
          ],
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
// 🔒 MANAGER LOGOUT STATUS
// Checks if the manager can log out:
//   1. No pending EA-assigned tasks for today
//   2. All running Marketing Dept projects have today's report submitted
//
const MARKETING_DEPARTMENTS = [
  "Marketing",
  "Marketing Department",
];

const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

exports.getManagerLogoutStatus = async (user) => {
  const { start, end } = getDayBounds();

  // ─── 1. Pending EA-assigned tasks for today ───────────────────────────────
  const eaAssignments = await prisma.taskAssignment.findMany({
    where: {
      userId: user.id,
      workDate: {
        gte: start,
        lt: end,
      },
      task: {
        createdBy: {
          role: "EA",
        },
      },
    },
    include: {
      task: {
        select: {
          id: true,
          projectName: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });

  // EA-created assignments use CoordinatorAssignment rather than the main
  // TaskAssignment table. Include them in the same manager obligation list.
  const eaCoordinatorAssignments = await prisma.coordinatorAssignment.findMany({
    where: {
      assignedToId: user.id,
      completionDate: {
        gte: start,
        lt: end,
      },
      createdBy: {
        role: "EA",
      },
    },
    include: {
      task: {
        select: {
          id: true,
          projectName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  const DONE_STATUSES = ["SUBMITTED", "VERIFIED"];
  const pendingEaTasks = [
    ...eaAssignments.map((assignment) => ({
      assignmentId: assignment.id,
      taskId: assignment.task.id,
      projectName: assignment.task.projectName,
      status: assignment.status,
      workDate: assignment.workDate,
      assignedBy: assignment.task.createdBy,
    })),
    ...eaCoordinatorAssignments.map((assignment) => ({
      assignmentId: assignment.id,
      taskId: assignment.task.id,
      projectName: assignment.task.projectName,
      status: assignment.status,
      workDate: assignment.completionDate,
      assignedBy: assignment.createdBy,
    })),
  ]
    .filter((a) => !DONE_STATUSES.includes(a.status))
    .sort((a, b) => new Date(a.workDate) - new Date(b.workDate));

  // ─── 2. Marketing projects assigned to this manager ──────────────────────
  // Find all running Marketing Dept projects where manager is assigned
  const projectAssignments = await prisma.projectAssignment.findMany({
    where: {
      managerId: user.id,
      project: {
        department: {
          name: {
            in: MARKETING_DEPARTMENTS,
          },
        },
      },
    },
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
          clientName: true,
          isRunning: true,
          department: {
            select: { id: true, name: true },
          },
          // Check today's marketing reports for this manager
          marketingReports: {
            where: {
              managerId: user.id,
              date: {
                gte: start,
                lt: end,
              },
            },
            select: {
              id: true,
              date: true,
              approvalStatus: true,
              unableToSubmitReason: true,
            },
          },
        },
      },
    },
  });

  const pendingMarketingReports = projectAssignments
    .filter((pa) => {
      const report = pa.project.marketingReports[0];
      return !report || report.approvalStatus !== "APPROVED";
    })
    .map((pa) => ({
      projectId: pa.project.id,
      projectName: pa.project.projectName,
      clientName: pa.project.clientName,
      department: pa.project.department?.name,
      isRunning: pa.project.isRunning,
      reportId: pa.project.marketingReports[0]?.id || null,
      reportStatus: pa.project.marketingReports[0]?.approvalStatus || "NOT_SUBMITTED",
      unableToSubmitReason: pa.project.marketingReports[0]?.unableToSubmitReason || null,
    }));

  const canLogout =
    pendingEaTasks.length === 0 && pendingMarketingReports.length === 0;

  return {
    canLogout,
    date: start.toISOString().slice(0, 10),
    pendingEaTasks,
    pendingMarketingReports,
  };
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
      role: "EMPLOYEE",
      OR: [
        { managerId: user.id },
        {
          employeeManagers: {
            some: { managerId: user.id },
          },
        },
      ],
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
      const assignments = await prisma.taskItemAssignment.findMany({
        where: { userId: emp.id },
      });

      return {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        totalTasksAssigned: assignments.length,
        completedTasksCount: assignments.filter(
          (a) => a.status === "COMPLETED" || a.status === "VERIFIED"
        ).length,
        inProgressTasksCount: assignments.filter(
          (a) => a.status === "IN_PROGRESS" || a.status === "SUBMITTED"
        ).length,
        draftTasksCount: assignments.filter(
          (a) => a.status === "ASSIGNED" || a.status === "PENDING" || a.status === "REJECTED" || a.status === "UNABLE_TO_SUBMIT"
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