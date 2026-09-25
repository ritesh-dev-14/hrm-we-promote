const prisma = require("../../config/prisma");
const { computeAllProjectHealth } = require("../health-score/health-score.service");

exports.getControlTowerStats = async () => {
  const now = new Date();
  
  // ── 1. Critical ──────────────────────────────────────────────────
  const overdueDeliverables = await prisma.taskItem.count({
    where: {
      dueDate: { lt: now },
      status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
    }
  });

  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oldApprovals = await prisma.taskItem.count({
    where: {
      clientApproved: false,
      status: "VERIFIED",
      assignments: { some: { verifiedAt: { lt: threeDaysAgo } } }
    }
  });

  // ── 2. This Week ─────────────────────────────────────────────────
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23,59,59,999);

  const allShoots = await prisma.shootTask.findMany({
    select: { date: true }
  });
  
  const shootsScheduled = allShoots.filter(shoot => {
    if (!shoot.date) return false;
    const shootDate = new Date(shoot.date);
    return shootDate >= startOfWeek && shootDate <= endOfWeek;
  }).length;

  const contentPiecesDue = await prisma.taskItem.count({
    where: {
      dueDate: { gte: startOfWeek, lte: endOfWeek },
      status: { notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"] },
    }
  });

  const marketingProjects = await prisma.project.aggregate({
    _sum: { monthlyBudget: true },
    where: {
      status: "ONGOING",
      department: { name: { in: ["Social Media", "Social Media Department", "Marketing", "Marketing Department", "Meta Ads", "Meta Ads Department"] } }
    }
  });
  const adSpendPlanned = Math.round((marketingProjects._sum.monthlyBudget || 0) / 4);

  // ── 3. People (Editors) ──────────────────────────────────────────
  const editorsWithOverdue = await prisma.user.findMany({
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
    select: { id: true, name: true, employeeId: true }
  });

  // ── 4. Clients ───────────────────────────────────────────────────
  const healthScores = await computeAllProjectHealth();
  let clientsAtRisk = 0;
  let clientsNotContacted7Days = 0;
  
  for (const h of healthScores) {
    if (h.status === "AT_RISK") clientsAtRisk++;
    if (h.breakdown.daysSinceLastComm && h.breakdown.daysSinceLastComm >= 7) clientsNotContacted7Days++;
  }

  return {
    critical: {
      overdueDeliverables,
      unresolvedComplaints: 0, // Placeholder for Phase 3
      oldApprovals
    },
    thisWeek: {
      shootsScheduled,
      contentPiecesDue,
      adSpendPlanned
    },
    people: {
      editorsWithOverdueCount: editorsWithOverdue.length,
      editorsWithOverdue,
      underutilizedEditors: 0 // Placeholder
    },
    clients: {
      atRisk: clientsAtRisk,
      notContacted7Days: clientsNotContacted7Days
    }
  };
};
