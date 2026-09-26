const prisma = require("../../config/prisma");
const { computeAllProjectHealth } = require("../health-score/health-score.service");

exports.getControlTowerStats = async () => {
  const now = new Date();
  
  // ── 1. Critical ──────────────────────────────────────────────────
  const overdueDeliverablesData = await prisma.taskItem.findMany({
    where: {
      dueDate: { lt: now },
      status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
    },
    select: { id: true, title: true, dueDate: true, task: { select: { project: { select: { projectName: true, clientName: true } } } } }
  });

  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oldApprovalsData = await prisma.taskItem.findMany({
    where: {
      clientApproved: false,
      status: "VERIFIED",
      assignments: { some: { verifiedAt: { lt: threeDaysAgo } } }
    },
    select: { id: true, title: true, task: { select: { project: { select: { projectName: true, clientName: true } } } } }
  });

  // ── 2. This Month ────────────────────────────────────────────────
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const allShoots = await prisma.shootTask.findMany({
    select: { date: true }
  });
  
  const shootsScheduled = allShoots.filter(shoot => {
    if (!shoot.date) return false;
    const shootDate = new Date(shoot.date);
    return shootDate >= startOfMonth && shootDate <= endOfMonth;
  }).length;

  const contentPiecesDue = await prisma.taskItem.count({
    where: {
      dueDate: { gte: startOfMonth, lte: endOfMonth },
      status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
    }
  });

  // ── Monthly Budget ──
  const marketingProjects = await prisma.project.findMany({
    where: {
      status: "ONGOING",
      department: { name: { in: ["Social Media", "Social Media Department", "Marketing", "Marketing Department", "Meta Ads", "Meta Ads Department"] } }
    },
    select: { id: true, projectName: true, clientName: true, monthlyBudget: true }
  });
  
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
  
  // ── Monthly Spent (MTD) ──
  const marketingReports = await prisma.marketingReport.groupBy({
    by: ['projectId'],
    _sum: { todayAmountSpend: true },
    where: {
      date: { gte: startOfMonth, lte: endOfMonth }
    }
  });

  let totalMonthlySpent = 0;
  const spentBreakdown = marketingReports.map(r => {
    const spent = r._sum.todayAmountSpend || 0;
    totalMonthlySpent += spent;
    const project = marketingProjects.find(p => p.id === r.projectId);
    return {
      projectName: project ? project.projectName : 'Unknown',
      clientName: project ? project.clientName : '',
      amount: spent
    };
  }).filter(p => p.amount > 0).sort((a, b) => b.amount - a.amount);

  // ── 3. People (Editors) ──────────────────────────────────────────
  const editorsWithOverdueData = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      taskItemAssignments: {
        some: {
          taskItem: {
            dueDate: { lt: now },
            status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] }
          }
        }
      }
    },
    select: { 
      id: true, 
      name: true, 
      employeeId: true,
      taskItemAssignments: {
        where: {
          taskItem: {
            dueDate: { lt: now },
            status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] }
          }
        },
        select: { id: true }
      }
    }
  });

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
      spentBreakdown
    },
    people: {
      editorsWithOverdueCount: editorsWithOverdue.length,
      editorsWithOverdue,
      underutilizedEditors: 0 // Placeholder
    }
  };
};
