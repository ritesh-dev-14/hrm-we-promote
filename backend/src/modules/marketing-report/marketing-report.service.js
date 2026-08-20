const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const formatReport = (report) => ({
  id: report.id,
  projectId: report.projectId,
  managerId: report.managerId,
  clientName: report.clientName,
  videoLink: report.videoLink,
  areaName: report.areaName,
  isAdRunning: report.isAdRunning,
  todayReachObtained: report.todayReachObtained,
  todayAmountSpend: report.todayAmountSpend,
  reasonNotRunning: report.reasonNotRunning,
  typeOfAds: report.typeOfAds,
  leadObtained: report.leadObtained,
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
});

// ─── Create ────────────────────────────────────────────────────────────────────
exports.createMarketingReport = async (user, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Only managers can submit marketing reports.",
    });
  }

  if (!body.projectId) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "projectId is required.",
    });
  }

  // Verify project exists and manager is assigned
  const project = await prisma.project.findUnique({
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

  const report = await prisma.marketingReport.create({
    data: {
      projectId: body.projectId,
      managerId: user.id,
      clientName: body.clientName || null,
      clientContactNumber: body.clientContactNumber || null,
      videoLink: body.videoLink || null,
      areaName: body.areaName || null,
      isAdRunning,
      todayReachObtained: body.todayReachObtained != null && body.todayReachObtained !== "" ? parseInt(body.todayReachObtained, 10) : null,
      todayAmountSpend: body.todayAmountSpend != null && body.todayAmountSpend !== "" ? parseFloat(body.todayAmountSpend) : null,
      reasonNotRunning: body.reasonNotRunning || null,
      typeOfAds: body.typeOfAds || null,
      leadObtained: body.leadObtained != null && body.leadObtained !== "" ? parseInt(body.leadObtained, 10) : null,
      date: body.date ? new Date(body.date) : new Date(),
    },
    include: {
      manager: { select: { id: true, name: true, employeeId: true, role: true } },
      project: {
        select: {
          id: true,
          projectName: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
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
    include: {
      manager: { select: { id: true, name: true, employeeId: true, role: true } },
      project: {
        select: {
          id: true,
          projectName: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
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
  if (body.date !== undefined) data.date = body.date ? new Date(body.date) : null;

  const updated = await prisma.marketingReport.update({
    where: { id: reportId },
    data,
    include: {
      manager: { select: { id: true, name: true, employeeId: true, role: true } },
      project: {
        select: {
          id: true,
          projectName: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
  });

  return formatReport(updated);
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
