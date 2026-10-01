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

  // ─── 1. Pending EA/Coordinator-assigned tasks for today ───────────────────
  const eaAssignments = await prisma.taskAssignment.findMany({
    where: {
      userId: user.id,
      workDate: {
        gte: start,
        lt: end,
      },
      task: {
        createdBy: {
          role: { in: ["EA", "COORDINATOR"] },
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
        role: { in: ["EA", "COORDINATOR"] },
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

  const DONE_STATUSES = ["SUBMITTED", "VERIFIED", "COMPLETED"];
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

  // ─── 3. Weekly Voice Reports (Only on Saturday) ──────────────────────────
  let pendingWeeklyVoiceReports = [];
  const isSaturday = start.getDay() === 6; // 6 is Saturday

  if (isSaturday) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    const year = now.getFullYear();

    // Get all active projects assigned to this manager
    const activeProjectAssignments = await prisma.projectAssignment.findMany({
      where: {
        managerId: user.id,
        project: {
          OR: [
            { isRunning: true },
            { status: "ONGOING" }
          ]
        },
      },
      include: {
        project: true
      }
    });

    // Find reports they have already submitted this week
    const submittedReports = await prisma.weeklyVoiceReport.findMany({
      where: {
        managerId: user.id,
        weekNumber,
        year
      }
    });

    const submittedClientIds = new Set();
    submittedReports.forEach(r => {
      // Depending on how JSON is returned by Prisma (string vs object)
      const clientsObj = typeof r.clients === 'string' ? JSON.parse(r.clients) : r.clients;
      if (Array.isArray(clientsObj)) {
        clientsObj.forEach(c => submittedClientIds.add(String(c.id)));
      } else if (clientsObj && clientsObj.id) {
        submittedClientIds.add(String(clientsObj.id));
      }
    });

    pendingWeeklyVoiceReports = activeProjectAssignments
      .filter(pa => !submittedClientIds.has(String(pa.projectId)))
      .map(pa => ({
        projectId: pa.projectId,
        projectName: pa.project.projectName || pa.project.clientName
      }));
  }

  // ─── 4. Content Calendar Uploads (Pending Uploads for Today) ─────────────
  const uploadsSheets = await prisma.projectMonthlySheet.findMany({
    where: {
      project: {
        assignments: {
          some: { managerId: user.id }
        },
        department: { name: { in: ["SEO", "Social Media", "Social Media Department"] } }
      }
    },
    include: {
      days: {
        where: {
          date: {
            gte: start,
            lt: end,
          },
          OR: [
            { uploadStatus: "PENDING" }
          ]
        }
      },
      project: {
        select: {
          projectName: true,
          clientName: true,
        }
      }
    }
  });

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
        include: { taskItem: true },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let overdueTasks = [];
      let dueTodayTasks = [];

      assignments.forEach((a) => {
        if (['COMPLETED', 'VERIFIED'].includes(a.status)) return;
        const dueDate = a.taskItem?.dueDate;
        if (!dueDate) return;

        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) overdueTasks.push(a);
        if (diffDays === 0) dueTodayTasks.push(a);
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
        overdueTasksCount: overdueTasks.length,
        dueTodayTasksCount: dueTodayTasks.length,
        assignments: assignments.map(a => ({
          ...a,
          employee: { id: emp.id, name: emp.name }
        }))
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