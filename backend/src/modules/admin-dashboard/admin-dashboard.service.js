const prisma = require("../../config/prisma");
const { computeAllProjectHealth } = require("../health-score/health-score.service");

exports.getControlTowerStats = async () => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    overdueDeliverablesData,
    oldApprovalsData,
    allShoots,
    contentPiecesDue,
    marketingProjects,
    marketingReports,
    editorsWithOverdueData,
  ] = await Promise.all([
    prisma.taskItem.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        task: {
          select: { project: { select: { projectName: true, clientName: true } } },
        },
      },
    }),
    prisma.taskItem.findMany({
      where: {
        clientApproved: false,
        status: "VERIFIED",
        assignments: { some: { verifiedAt: { lt: threeDaysAgo } } },
      },
      select: {
        id: true,
        title: true,
        task: {
          select: { project: { select: { projectName: true, clientName: true } } },
        },
      },
    }),
    prisma.shootTask.findMany({ select: { date: true } }),
    prisma.taskItem.count({
      where: {
        dueDate: { gte: startOfMonth, lte: endOfMonth },
        status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
      },
    }),
    prisma.project.findMany({
      where: {
        status: "ONGOING",
        department: {
          name: {
            in: [
              "Social Media",
              "Social Media Department",
              "Marketing",
              "Marketing Department",
              "Meta Ads",
              "Meta Ads Department",
            ],
          },
        },
      },
      select: { id: true, projectName: true, clientName: true, monthlyBudget: true },
    }),
    prisma.marketingReport.groupBy({
      by: ["projectId", "date"],
      _sum: { todayAmountSpend: true },
      where: {
        date: { lt: startOfNextMonth },
        project: {
          status: "ONGOING",
          department: {
            name: {
              in: [
                "Social Media",
                "Social Media Department",
                "Marketing",
                "Marketing Department",
                "Meta Ads",
                "Meta Ads Department",
              ],
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        taskItemAssignments: {
          some: {
            taskItem: {
              dueDate: { lt: now },
              status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        employeeId: true,
        taskItemAssignments: {
          where: {
            taskItem: {
              dueDate: { lt: now },
              status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
            },
          },
          select: { id: true },
        },
      },
    }),
  ]);

  const shootsScheduled = allShoots.filter((shoot) => {
    if (!shoot.date) return false;
    const shootDate = new Date(shoot.date);
    return shootDate >= startOfMonth && shootDate <= endOfMonth;
  }).length;
  
  // ── Monthly Budget ──
  let totalMonthlyBudget = 0;
  const budgetBreakdown = marketingProjects.map(p => {
    const budget = p.monthlyBudget || 0;
    totalMonthlyBudget += budget;
    return {
      projectId: p.id,
      projectName: p.projectName,
      clientName: p.clientName,
      amount: budget
    };
  }).filter(p => p.amount > 0).sort((a, b) => b.amount - a.amount);
  
  const monthlySpendByProject = new Map();
  marketingReports.forEach((report) => {
    const date = new Date(report.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${report.projectId}:${year}-${String(month).padStart(2, "0")}`;
    const existing = monthlySpendByProject.get(key);
    const amount = report._sum.todayAmountSpend || 0;
    if (existing) {
      existing.amount += amount;
    } else {
      monthlySpendByProject.set(key, { projectId: report.projectId, month, year, amount });
    }
  });
  const monthlySpentBreakdown = [...monthlySpendByProject.values()];
  const currentMonthSpend = monthlySpentBreakdown.filter(
    (item) => item.year === now.getFullYear() && item.month === now.getMonth() + 1,
  );
  const totalMonthlySpent = currentMonthSpend.reduce((total, item) => total + item.amount, 0);
  const spentBreakdown = currentMonthSpend.map((item) => {
    const project = marketingProjects.find((candidate) => candidate.id === item.projectId);
    return {
      projectId: item.projectId,
      projectName: project ? project.projectName : "Unknown",
      clientName: project ? project.clientName : "",
      amount: item.amount,
    };
  }).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const marketingProjectNames = new Map(marketingProjects.map((project) => [
    project.id,
    { projectName: project.projectName, clientName: project.clientName },
  ]));
  const monthlySpendBreakdown = monthlySpentBreakdown.map((item) => ({
    ...item,
    ...marketingProjectNames.get(item.projectId),
  }));

  // ── 3. People (Editors) ──────────────────────────────────────────
  const editorsWithOverdue = editorsWithOverdueData.map(e => ({
    id: e.id,
    name: e.name,
    employeeId: e.employeeId,
    overdueCount: e.taskItemAssignments.length
  })).sort((a, b) => b.overdueCount - a.overdueCount);

  // Clients health calculation has been moved to the frontend to drastically reduce loading time

  return {
    critical: {
      overdueDeliverables: overdueDeliverablesData.length,
      overdueDeliverablesList: overdueDeliverablesData,
      unresolvedComplaints: 0, // Placeholder for Phase 3
      oldApprovals: oldApprovalsData.length,
      oldApprovalsList: oldApprovalsData
    },
    thisWeek: {
      shootsScheduled,
      contentPiecesDue,
      totalMonthlyBudget,
      budgetBreakdown,
      totalMonthlySpent,
      spentBreakdown,
      monthlySpendBreakdown,
    },
    people: {
      editorsWithOverdueCount: editorsWithOverdue.length,
      editorsWithOverdue,
      underutilizedEditors: 0 // Placeholder
    }
  };
};
