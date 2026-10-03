const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const formatReport = (report) => ({
  id: report.id,
  projectId: report.projectId,
  campaignId: report.campaignId || null,
  managerId: report.managerId,
  clientName: report.clientName,
  clientContactNumber: report.clientContactNumber,
  videoLink: report.videoLink,
  areaName: report.areaName,
  isAdRunning: report.isAdRunning,
  todayReachObtained: report.todayReachObtained,
  todayAmountSpend: report.todayAmountSpend,
  reasonNotRunning: report.reasonNotRunning,
  unableToSubmitReason: report.unableToSubmitReason,
  approvalStatus: report.approvalStatus,
  reviewedById: report.reviewedById,
  reviewedAt: report.reviewedAt,
  reviewNote: report.reviewNote,
  typeOfAds: report.typeOfAds,
  leadObtained: report.leadObtained,
  decidedDailyBudget: report.decidedDailyBudget,
  leadSentToClient: report.leadSentToClient,
  startDate: report.startDate,
  campaignStartDate: report.campaignStartDate,
  date: report.date,
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  manager: report.manager
    ? {
        id: report.manager.id,
        name: report.manager.name,
        employeeId: report.manager.employeeId,
        role: report.manager.role,
      }
    : null,
  project: report.project
    ? {
        id: report.project.id,
        projectName: report.project.projectName,
        department: report.project.department || null,
      }
    : null,
  campaign: report.campaign
    ? {
        id: report.campaign.id,
        name: report.campaign.name,
      }
    : null,
});

const reportInclude = {
  manager: { select: { id: true, name: true, employeeId: true, role: true } },
  reviewedBy: { select: { id: true, name: true, employeeId: true, role: true } },
  campaign: { select: { id: true, name: true } },
  project: {
    select: {
      id: true,
      projectName: true,
      department: { select: { id: true, name: true } },
    },
  },
};

// ─── Create ────────────────────────────────────────────────────────────────────
exports.createMarketingReport = async (user, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Only managers can submit marketing reports.",
    });
  }

  if (!body.projectId && !body.campaignId) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "projectId or campaignId is required.",
    });
  }

  const unableToSubmitReason = body.unableToSubmitReason?.trim() || null;
  if (unableToSubmitReason && body.isAdRunning !== undefined) {
    throw new ApiError(400, "Do not submit running-report fields with an unable-to-submit reason.");
  }
  if (!unableToSubmitReason && body.isAdRunning === undefined) {
    throw new ApiError(400, "Select whether the project is running or provide a reason for not filling the report.");
  }
  if (body.isAdRunning === false && !body.reasonNotRunning?.trim()) {
    throw new ApiError(400, "Provide a reason when the project is not running.");
  }

  // Verify project exists and manager is assigned
  const campaign = body.campaignId
    ? await prisma.campaign.findUnique({
        where: { id: body.campaignId },
        include: { project: { include: { assignments: true } } },
      })
    : null;
  if (body.campaignId && !campaign) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Campaign not found.",
    });
  }
  if (campaign && body.projectId && campaign.projectId !== body.projectId) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Campaign does not belong to this project.",
    });
  }
  const project = campaign?.project || await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { assignments: true },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  const isAssigned = project.assignments.some((a) => a.managerId === user.id);
  if (!isAssigned) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "You are not assigned to this project.",
    });
  }

  // Parse optional boolean
  let isAdRunning = null;
  if (body.isAdRunning !== undefined && body.isAdRunning !== null && body.isAdRunning !== "") {
    isAdRunning = body.isAdRunning === true || body.isAdRunning === "true" || body.isAdRunning === "yes";
  }

  let leadSentToClient = null;
  if (body.leadSentToClient !== undefined && body.leadSentToClient !== null && body.leadSentToClient !== "") {
    const value = String(body.leadSentToClient).trim().toLowerCase();
    if (!["true", "false", "yes", "no"].includes(value)) {
      throw new ApiError(400, { code: ERRORS.VALIDATION.INVALID_INPUT.code, message: "leadSentToClient must be yes or no." });
    }
    leadSentToClient = value === "true" || value === "yes";
  }

  const report = await prisma.marketingReport.create({
    data: {
      projectId: project.id,
      campaignId: body.campaignId || null,
      managerId: user.id,
      clientName: body.clientName || null,
      clientContactNumber: body.clientContactNumber || null,
      videoLink: body.videoLink || null,
      areaName: body.areaName || null,
      isAdRunning,
      todayReachObtained: body.todayReachObtained != null && body.todayReachObtained !== "" ? parseInt(body.todayReachObtained, 10) : null,
      todayAmountSpend: body.todayAmountSpend != null && body.todayAmountSpend !== "" ? parseFloat(body.todayAmountSpend) : null,
      reasonNotRunning: body.reasonNotRunning || null,
        unableToSubmitReason,
        approvalStatus: "PENDING",
      typeOfAds: body.typeOfAds || null,
      leadObtained: body.leadObtained != null && body.leadObtained !== "" ? parseInt(body.leadObtained, 10) : null,
      decidedDailyBudget: body.decidedDailyBudget != null && body.decidedDailyBudget !== "" ? parseFloat(body.decidedDailyBudget) : null,
      leadSentToClient,
      startDate: body.startDate ? new Date(body.startDate) : null,
      campaignStartDate: body.campaignStartDate ? new Date(body.campaignStartDate) : null,
      date: body.date ? new Date(body.date) : new Date(),
    },
    include: reportInclude,
  });

  return formatReport(report);
};

// ─── Get all for a project ─────────────────────────────────────────────────────
exports.getMarketingReports = async (user, projectId) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { assignments: true },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (user.role === "MANAGER") {
    const isAssigned = project.assignments.some((a) => a.managerId === user.id);
    if (!isAssigned) {
      throw new ApiError(403, {
        code: ERRORS.AUTH.ACCESS_DENIED.code,
        message: "You are not assigned to this project.",
      });
    }
  }

  const reports = await prisma.marketingReport.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
    include: reportInclude,
  });

  return reports.map(formatReport);
};

exports.getCampaignReports = async (user, campaignId) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { project: { include: { assignments: true } } },
  });
  if (!campaign) throw new ApiError(404, "Campaign not found.");
  if (user.role === "MANAGER" && !campaign.project.assignments.some((a) => a.managerId === user.id)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  const reports = await prisma.marketingReport.findMany({
    where: { campaignId },
    orderBy: { date: "desc" },
    include: reportInclude,
  });
  return reports.map(formatReport);
};

// ─── Get single ────────────────────────────────────────────────────────────────
exports.getMarketingReportById = async (user, reportId) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const report = await prisma.marketingReport.findUnique({
    where: { id: reportId },
    include: {
      manager: { select: { id: true, name: true, employeeId: true, role: true } },
      campaign: { select: { id: true, name: true } },
      project: {
        include: {
          department: true,
          assignments: true,
        },
      },
    },
  });

  if (!report) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Marketing report not found.",
    });
  }

  if (user.role === "MANAGER") {
    const isAssigned = report.project.assignments.some((a) => a.managerId === user.id);
    if (!isAssigned) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }
  }

  return formatReport(report);
};

// ─── Update ────────────────────────────────────────────────────────────────────
exports.updateMarketingReport = async (user, reportId, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Only managers can update marketing reports.",
    });
  }

  const existing = await prisma.marketingReport.findUnique({ where: { id: reportId } });
  if (!existing) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Marketing report not found.",
    });
  }

  if (existing.managerId !== user.id) {

      if (existing.approvalStatus === "APPROVED") {
        throw new ApiError(400, "Approved reports cannot be edited. Contact HR if a correction is required.");
      }
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "You can only update your own marketing reports.",
    });
  }

  // Build update payload — only update fields that were explicitly provided
  const data = {};
  if (body.clientName !== undefined) data.clientName = body.clientName || null;
  if (body.clientContactNumber !== undefined) data.clientContactNumber = body.clientContactNumber || null;
  if (body.videoLink !== undefined) data.videoLink = body.videoLink || null;
  if (body.areaName !== undefined) data.areaName = body.areaName || null;
  if (body.isAdRunning !== undefined && body.isAdRunning !== null && body.isAdRunning !== "") {
    data.isAdRunning = body.isAdRunning === true || body.isAdRunning === "true" || body.isAdRunning === "yes";
  }
  if (body.todayReachObtained !== undefined) data.todayReachObtained = body.todayReachObtained != null && body.todayReachObtained !== "" ? parseInt(body.todayReachObtained, 10) : null;
  if (body.todayAmountSpend !== undefined) data.todayAmountSpend = body.todayAmountSpend != null && body.todayAmountSpend !== "" ? parseFloat(body.todayAmountSpend) : null;
  if (body.reasonNotRunning !== undefined) data.reasonNotRunning = body.reasonNotRunning || null;
  if (body.typeOfAds !== undefined) data.typeOfAds = body.typeOfAds || null;
  if (body.leadObtained !== undefined) data.leadObtained = body.leadObtained != null && body.leadObtained !== "" ? parseInt(body.leadObtained, 10) : null;
  if (body.decidedDailyBudget !== undefined) data.decidedDailyBudget = body.decidedDailyBudget != null && body.decidedDailyBudget !== "" ? parseFloat(body.decidedDailyBudget) : null;
  if (body.leadSentToClient !== undefined) {
    if (body.leadSentToClient === null || body.leadSentToClient === "") {
      data.leadSentToClient = null;
    } else {
      const value = String(body.leadSentToClient).trim().toLowerCase();
      if (!["true", "false", "yes", "no"].includes(value)) {
        throw new ApiError(400, { code: ERRORS.VALIDATION.INVALID_INPUT.code, message: "leadSentToClient must be yes or no." });
      }
      data.leadSentToClient = value === "true" || value === "yes";
    }
  }
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.campaignStartDate !== undefined) data.campaignStartDate = body.campaignStartDate ? new Date(body.campaignStartDate) : null;
  if (body.date !== undefined) data.date = body.date ? new Date(body.date) : null;

  data.approvalStatus = "PENDING";
  data.reviewedById = null;
  data.reviewedAt = null;
  data.reviewNote = null;

  const updated = await prisma.marketingReport.update({
    where: { id: reportId },
    data,
    include: reportInclude,
  });

  return formatReport(updated);
};

// ─── HR review ────────────────────────────────────────────────────────────────
exports.reviewMarketingReport = async (user, reportId, body) => {
  if (!["HR", "ADMIN"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  if (!["APPROVED", "REJECTED"].includes(body.status)) {
    throw new ApiError(400, "Status must be APPROVED or REJECTED.");
  }
  if (body.status === "REJECTED" && !body.reviewNote?.trim()) {
    throw new ApiError(400, "A review note is required when rejecting a report.");
  }

  const report = await prisma.marketingReport.update({
    where: { id: reportId },
    data: {
      approvalStatus: body.status,
      reviewedById: user.id,
      reviewedAt: new Date(),
      reviewNote: body.reviewNote?.trim() || null,
    },
    include: reportInclude,
  });
  return formatReport(report);
};

// ─── Delete ────────────────────────────────────────────────────────────────────
exports.deleteMarketingReport = async (user, reportId) => {
  if (!["ADMIN", "HR", "EA"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existing = await prisma.marketingReport.findUnique({ where: { id: reportId } });
  if (!existing) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Marketing report not found.",
    });
  }

  await prisma.marketingReport.delete({ where: { id: reportId } });
  return { id: reportId, deleted: true };
};
