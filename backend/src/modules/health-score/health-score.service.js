const prisma = require("../../config/prisma");

/**
 * Health Score Algorithm
 * ─────────────────────────────────────────────────────────────────
 * Scores each project from 0 (worst) → 100 (best) based on:
 *
 *  1. Overdue task-items             → deduct up to 40 pts
 *  2. Pending client approvals > 3d  → deduct up to 30 pts
 *  3. Days since last WhatsApp msg   → deduct up to 20 pts
 *  4. Renewal status                 → deduct up to 10 pts
 *
 * Final classification:
 *   🟢 HEALTHY   score >= 70
 *   🟡 ATTENTION score >= 40
 *   🔴 AT_RISK   score < 40
 */

const DAY_MS = 1000 * 60 * 60 * 24;

function daysBetween(dateA, dateB) {
  return Math.floor((dateB - dateA) / DAY_MS);
}

function classifyScore(score) {
  if (score >= 70) return "HEALTHY";
  if (score >= 40) return "ATTENTION";
  return "AT_RISK";
}

/**
 * Compute health score for a single project.
 * @param {string} projectId
 * @returns {{ projectId, score, status, breakdown }}
 */
async function computeProjectHealth(projectId) {
  const now = new Date();
  let score = 100;
  const breakdown = {};

  // ── 1. Overdue TaskItems ─────────────────────────────────────────
  const overdueTaskItems = await prisma.taskItem.count({
    where: {
      task: { projectId },
      dueDate: { lt: now },
      status: {
        notIn: ["COMPLETED", "VERIFIED", "UNABLE_TO_SUBMIT"],
      },
    },
  });

  breakdown.overdueTaskItems = overdueTaskItems;

  if (overdueTaskItems >= 5) score -= 40;
  else if (overdueTaskItems >= 3) score -= 25;
  else if (overdueTaskItems >= 1) score -= 12;

  // ── 2. Pending Client Approvals > 3 days ────────────────────────
  const threeDaysAgo = new Date(now.getTime() - 3 * DAY_MS);

  const pendingOldApprovals = await prisma.taskItem.count({
    where: {
      task: { projectId },
      clientApproved: false,
      status: "VERIFIED",
      // items that were verified (sent to client) more than 3 days ago
      assignments: {
        some: {
          verifiedAt: { lt: threeDaysAgo },
        },
      },
    },
  });

  breakdown.pendingOldApprovals = pendingOldApprovals;

  if (pendingOldApprovals >= 3) score -= 30;
  else if (pendingOldApprovals >= 1) score -= 15;

  // ── 3. Last Communication (WhatsApp) ────────────────────────────
  const lastMsg = await prisma.whatsappMessage.findFirst({
    where: {
      projectId,
      status: { in: ["SENT", "DELIVERED", "READ"] },
    },
    orderBy: { sentAt: "desc" },
    select: { sentAt: true },
  });

  const daysSinceLastComm = lastMsg?.sentAt
    ? daysBetween(new Date(lastMsg.sentAt), now)
    : 999; // never communicated

  breakdown.daysSinceLastComm =
    daysSinceLastComm === 999 ? null : daysSinceLastComm;

  if (daysSinceLastComm > 14) score -= 20;
  else if (daysSinceLastComm > 7) score -= 10;

  // ── 4. Renewal Status ───────────────────────────────────────────
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { renewalDate: true },
  });

  const daysUntilRenewal = project?.renewalDate
    ? daysBetween(now, new Date(project.renewalDate))
    : null;

  breakdown.daysUntilRenewal = daysUntilRenewal;

  if (daysUntilRenewal !== null && daysUntilRenewal < 0) {
    score -= 10; // overdue renewal
  } else if (daysUntilRenewal !== null && daysUntilRenewal <= 7) {
    score -= 5; // renewal very soon
  }

  // ── Clamp ────────────────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score));

  return {
    projectId,
    score,
    status: classifyScore(score),
    breakdown,
  };
}

/**
 * Compute health scores for all (or specific) projects.
 * @param {string[]} [projectIds]  – if omitted, all ONGOING projects are scored
 * @returns {Array}
 */
async function computeAllProjectHealth(projectIds) {
  let ids = projectIds;

  if (!ids || ids.length === 0) {
    const projects = await prisma.project.findMany({
      where: { status: "ONGOING" },
      select: { id: true },
    });
    ids = projects.map((p) => p.id);
  }

  // Run all in parallel (batched to avoid DB overload)
  const BATCH = 10;
  const results = [];

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map((id) => computeProjectHealth(id))
    );
    results.push(...batchResults);
  }

  return results;
}

module.exports = { computeProjectHealth, computeAllProjectHealth };
