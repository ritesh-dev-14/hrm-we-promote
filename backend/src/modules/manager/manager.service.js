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
  const DONE_STATUSES = ["VERIFIED", "COMPLETED"];
  const getWeekNumber = (date = new Date()) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diffDays = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.floor(diffDays / 7) + 1;
  };
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  // These checks do not depend on each other, so run their database reads together.
  const [
    eaAssignments,
    eaCoordinatorAssignments,
    projectAssignments,
    activeProjectAssignments,
    submittedReports,
    uploadsSheets,
  ] = await Promise.all([
    prisma.taskAssignment.findMany({
      where: {
        userId: user.id,
        workDate: { gte: start, lt: end },
        status: { notIn: DONE_STATUSES },
        task: {
          createdBy: {
            role: { in: ["EA", "COORDINATOR"] },
          },
        },
      },
      select: {
        id: true,
        status: true,
        workDate: true,
        task: {
          select: {
            id: true,
            projectName: true,
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    }),
    prisma.coordinatorAssignment.findMany({
      where: {
        assignedToId: user.id,
        completionDate: { gte: start, lt: end },
        status: { notIn: DONE_STATUSES },
        createdBy: {
          role: { in: ["EA", "COORDINATOR"] },
        },
      },
      select: {
        id: true,
        status: true,
        completionDate: true,
        task: {
          select: { id: true, projectName: true },
        },
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    }),
    prisma.projectAssignment.findMany({
      where: {
        managerId: user.id,
        project: {
          department: {
            name: { in: MARKETING_DEPARTMENTS },
          },
        },
      },
      select: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
            isRunning: true,
            department: {
              select: { id: true, name: true },
            },
            marketingReports: {
              where: {
                managerId: user.id,
                date: { gte: start, lt: end },
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
    }),
    prisma.projectAssignment.findMany({
      where: {
        managerId: user.id,
        project: {
          OR: [{ isRunning: true }, { status: "ONGOING" }],
        },
      },
      select: {
        projectId: true,
        project: {
          select: {
            projectName: true,
            clientName: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.weeklyVoiceReport.findMany({
      where: {
        managerId: user.id,
        weekNumber,
        year,
        qaStatus: { not: "REJECTED" },
      },
      select: { clients: true },
    }),
    prisma.projectMonthlySheet.findMany({
      where: {
        project: {
          assignments: { some: { managerId: user.id } },
          department: {
            name: { in: ["SEO", "Social Media", "Social Media Department"] },
          },
        },
      },
      select: {
        id: true,
        projectId: true,
        days: {
          where: {
            date: { gte: start, lt: end },
            uploadStatus: "PENDING",
          },
          select: { id: true, title: true },
        },
        project: {
          select: { projectName: true, clientName: true },
        },
      },
    }),
  ]);

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

  const pendingMarketingReports = projectAssignments
    .filter((pa) => {
      const report = pa.project.marketingReports[0];
      return !report || report.approvalStatus === "REJECTED";
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

  const submittedClientIds = new Set();
  submittedReports.forEach(r => {
    // Depending on how JSON is returned by Prisma (string vs object)
    const clientsObj = typeof r.clients === 'string' ? JSON.parse(r.clients) : r.clients;
    if (Array.isArray(clientsObj)) {
      clientsObj.forEach(c => {
        if (c?.id) submittedClientIds.add(String(c.id));
      });
    } else if (clientsObj && clientsObj.id) {
      submittedClientIds.add(String(clientsObj.id));
    }
  });

  const normalizeDept = (deptName) => {
    const lower = String(deptName || "").toLowerCase().trim();
    if (lower.includes("seo")) return "SEO";
    if (lower.includes("social") || lower.includes("smm")) return "Social Media";
    return "Marketing";
  };

  const pendingWeeklyVoiceReports = activeProjectAssignments
    .filter(pa => !submittedClientIds.has(String(pa.projectId)))
    .map(pa => ({
      projectId: pa.projectId,
      projectName: pa.project.projectName || pa.project.clientName,
      clientName: pa.project.clientName,
      department: normalizeDept(pa.project.department?.name),
      departmentName: pa.project.department?.name || "Marketing",
      weekNumber,
      year,
      status: "PENDING",
      workDate: now.toISOString(),
      date: now.toISOString().slice(0, 10),
    }));

  // ─── 4. Content Calendar Uploads (Pending Uploads for Today) ─────────────
  const pendingUploads = [];
  for (const sheet of uploadsSheets) {
    if (sheet.days && sheet.days.length > 0) {
      for (const day of sheet.days) {
        pendingUploads.push({
          id: `${sheet.id}-${day.id}`,
          projectId: sheet.projectId,
          projectName: sheet.project?.projectName,
          clientName: sheet.project?.clientName,
          title: day.title,
        });
      }
    }
  }

  const canLogout =
    pendingEaTasks.length === 0 && 
    pendingMarketingReports.length === 0 &&
    pendingWeeklyVoiceReports.length === 0 &&
    pendingUploads.length === 0;

  return {
    canLogout,
    date: start.toISOString().slice(0, 10),
    pendingEaTasks,
    pendingMarketingReports,
    pendingWeeklyVoiceReports,
    pendingUploads,
  };
};

//
// 🔥 GET MANAGER DASHBOARD STATS
//
exports.getDashboardStats = async (user) => {
  const [tasks, employees] = await Promise.all([
    prisma.task.findMany({
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
      select: {
        status: true,
      },
    }),
    prisma.user.findMany({
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
    }),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const draftTasks = tasks.filter((task) => task.status === "DRAFT").length;

  const assignments = employees.length
    ? await prisma.taskItemAssignment.findMany({
        where: { userId: { in: employees.map((employee) => employee.id) } },
        include: {
          taskItem: {
            select: {
              title: true,
              dueDate: true,
            },
          },
        },
      })
    : [];

  const assignmentsByEmployee = new Map(employees.map((employee) => [employee.id, []]));
  assignments.forEach((assignment) => {
    assignmentsByEmployee.get(assignment.userId)?.push(assignment);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employeeStats = employees.map((employee) => {
    const employeeAssignments = assignmentsByEmployee.get(employee.id) || [];
    let overdueTasksCount = 0;
    let dueTodayTasksCount = 0;

    employeeAssignments.forEach((assignment) => {
      if (["COMPLETED", "VERIFIED"].includes(assignment.status) || !assignment.taskItem?.dueDate) {
        return;
      }

      const dueDate = new Date(assignment.taskItem.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) overdueTasksCount += 1;
      if (diffDays === 0) dueTodayTasksCount += 1;
    });

    return {
      ...employee,
      totalTasksAssigned: employeeAssignments.length,
      completedTasksCount: employeeAssignments.filter(
        (assignment) => assignment.status === "COMPLETED" || assignment.status === "VERIFIED"
      ).length,
      inProgressTasksCount: employeeAssignments.filter(
        (assignment) => assignment.status === "IN_PROGRESS" || assignment.status === "SUBMITTED"
      ).length,
      draftTasksCount: employeeAssignments.filter(
        (assignment) => ["ASSIGNED", "PENDING", "REJECTED", "UNABLE_TO_SUBMIT"].includes(assignment.status)
      ).length,
      overdueTasksCount,
      dueTodayTasksCount,
      assignments: employeeAssignments.map((assignment) => ({
        ...assignment,
        employee: { id: employee.id, name: employee.name },
      })),
    };
  });

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    draftTasks,
    totalEmployees: employees.length,
    employees: employeeStats,
  };
};