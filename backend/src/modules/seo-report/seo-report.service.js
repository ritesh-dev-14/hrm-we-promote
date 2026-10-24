const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const cloudinary = require("../../utils/cloudinary");

const SEO_DEPARTMENTS = ["SEO", "SEO Department", "Seo Department"];
const hasRole = (user, role) =>
  (user.roles?.length ? user.roles : [user.role])
    .some((userRole) => String(userRole).toUpperCase() === role);

const formatReport = (report) => ({
  id: report.id,
  projectId: report.projectId,
  managerId: report.managerId,
  keywords: report.keywords,
  clientContactNumber: report.clientContactNumber,
  rankingNo: report.rankingNo,
  checkDate: report.checkDate,
  sheetUrl: report.sheetUrl,
  screenshotUrl: report.screenshotUrl,
  screenshotPublicId: report.screenshotPublicId,
  remarks: report.remarks,
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

exports.createSeoReport = async (user, body, file) => {
  if (!hasRole(user, "MANAGER")) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Only managers can submit SEO reports.",
    });
  }

  if (!file) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Screenshot is required.",
    });
  }

  // Validate required fields
  if (
    !body.projectId ||
    !body.keywords ||
    !body.rankingNo ||
    !body.checkDate ||
    !body.sheetUrl
  ) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "projectId, keywords, rankingNo, checkDate, and sheetUrl are required.",
    });
  }

  let sheetUrl;
  if (typeof body.sheetUrl !== "string") {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A valid online spreadsheet link is required.",
    });
  }
  try {
    sheetUrl = new URL(body.sheetUrl);
  } catch {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A valid online spreadsheet link is required.",
    });
  }
  if (!["http:", "https:"].includes(sheetUrl.protocol)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "The spreadsheet link must use HTTP or HTTPS.",
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: {
      department: true,
      assignments: true,
    },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (!SEO_DEPARTMENTS.some((d) => project.department?.name?.toLowerCase().includes("seo"))) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "SEO reports can only be submitted for SEO department projects.",
    });
  }

  // Check manager is assigned to this project
  const isAssigned = project.assignments.some(
    (a) => a.managerId === user.id
  );
  if (!isAssigned) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "You are not assigned to this project.",
    });
  }

  // Parse keywords (could be JSON string or array)
  let keywords = body.keywords;
  if (typeof keywords === "string") {
    try {
      keywords = JSON.parse(keywords);
    } catch {
      keywords = [keywords];
    }
  }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "At least one keyword is required.",
    });
  }

  // Upload screenshot to Cloudinary
  let screenshotUrl = "";
  let screenshotPublicId = null;
  try {
    const result = await cloudinary.uploadBuffer(file.buffer, {
      folder: "seo-reports",
      resource_type: "image",
    });
    screenshotUrl = result.secure_url;
    screenshotPublicId = result.public_id;
  } catch (uploadErr) {
    throw new ApiError(500, {
      code: ERRORS.SERVER.INTERNAL_ERROR.code,
      message: `Screenshot upload failed: ${uploadErr.message}`,
    });
  }

  const report = await prisma.seoReport.create({
    data: {
      projectId: body.projectId,
      managerId: user.id,
      clientContactNumber: body.clientContactNumber || null,
      keywords,
      rankingNo: parseInt(body.rankingNo, 10),
      checkDate: new Date(body.checkDate),
      sheetUrl: sheetUrl.toString(),
      screenshotUrl,
      screenshotPublicId,
      remarks: body.remarks || null,
    },
    include: {
      manager: {
        select: { id: true, name: true, employeeId: true, role: true },
      },
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

exports.updateSeoReport = async (user, reportId, body, file) => {
  if (!hasRole(user, "MANAGER")) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existingReport = await prisma.seoReport.findUnique({
    where: { id: reportId },
    include: { project: { include: { assignments: true } } },
  });

  if (!existingReport) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "SEO report not found.",
    });
  }
  if (existingReport.managerId !== user.id) {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "You can only edit SEO reports that you submitted.",
    });
  }
  if (!existingReport.project.assignments.some((assignment) => assignment.managerId === user.id)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  let keywords = body.keywords;
  if (typeof keywords === "string") {
    try {
      keywords = JSON.parse(keywords);
    } catch {
      keywords = [keywords];
    }
  }
  if (!Array.isArray(keywords) || keywords.length === 0 || keywords.some((keyword) => typeof keyword !== "string" || !keyword.trim())) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "At least one keyword is required.",
    });
  }

  const rankingNo = Number(body.rankingNo);
  if (!Number.isInteger(rankingNo) || rankingNo < 1 || rankingNo > 9999) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A valid ranking number is required.",
    });
  }

  const checkDate = new Date(body.checkDate);
  if (!body.checkDate || Number.isNaN(checkDate.getTime())) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A valid check date is required.",
    });
  }

  if (typeof body.sheetUrl !== "string") {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A valid online spreadsheet link is required.",
    });
  }
  let sheetUrl;
  try {
    sheetUrl = new URL(body.sheetUrl);
  } catch {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "A valid online spreadsheet link is required.",
    });
  }
  if (!["http:", "https:"].includes(sheetUrl.protocol)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "The spreadsheet link must use HTTP or HTTPS.",
    });
  }

  let screenshotUrl = existingReport.screenshotUrl;
  let screenshotPublicId = existingReport.screenshotPublicId;
  if (file) {
    try {
      const result = await cloudinary.uploadBuffer(file.buffer, {
        folder: "seo-reports",
        resource_type: "image",
      });
      screenshotUrl = result.secure_url;
      screenshotPublicId = result.public_id;
    } catch (uploadErr) {
      throw new ApiError(500, {
        code: ERRORS.SERVER.INTERNAL_ERROR.code,
        message: `Screenshot upload failed: ${uploadErr.message}`,
      });
    }
  }

  const updatedReport = await prisma.seoReport.update({
    where: { id: reportId },
    data: {
      clientContactNumber: body.clientContactNumber || null,
      keywords: keywords.map((keyword) => keyword.trim()),
      rankingNo,
      checkDate,
      sheetUrl: sheetUrl.toString(),
      remarks: body.remarks || null,
      screenshotUrl,
      screenshotPublicId,
    },
    include: {
      manager: {
        select: { id: true, name: true, employeeId: true, role: true },
      },
      project: {
        select: {
          id: true,
          projectName: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
  });

  return formatReport(updatedReport);
};

exports.getSeoReports = async (user, projectId) => {
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
    const isAssigned = project.assignments.some(
      (a) => a.managerId === user.id
    );
    if (!isAssigned) {
      throw new ApiError(403, {
        code: ERRORS.AUTH.ACCESS_DENIED.code,
        message: "You are not assigned to this project.",
      });
    }
  }

  const reports = await prisma.seoReport.findMany({
    where: { projectId },
    orderBy: { checkDate: "desc" },
    include: {
      manager: {
        select: { id: true, name: true, employeeId: true, role: true },
      },
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

exports.getSubmittedProjectIds = async (user, query = {}) => {
  if (user.role !== "ADMIN") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const from = new Date(query.from);
  const to = new Date(query.to);
  if (!query.from || !query.to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Valid from and to date boundaries are required.",
    });
  }

  const submittedProjects = await prisma.seoReport.findMany({
    where: { createdAt: { gte: from, lt: to } },
    distinct: ["projectId"],
    select: { projectId: true },
  });

  return submittedProjects.map(({ projectId }) => projectId);
};

exports.getSeoReportById = async (user, reportId) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const report = await prisma.seoReport.findUnique({
    where: { id: reportId },
    include: {
      manager: {
        select: { id: true, name: true, employeeId: true, role: true },
      },
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
      message: "SEO report not found.",
    });
  }

  if (user.role === "MANAGER") {
    const isAssigned = report.project.assignments.some(
      (a) => a.managerId === user.id
    );
    if (!isAssigned) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }
  }

  return formatReport(report);
};

exports.deleteSeoReport = async (user, reportId) => {
  if (!["ADMIN", "HR", "EA"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const report = await prisma.seoReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "SEO report not found.",
    });
  }

  await prisma.seoReport.delete({ where: { id: reportId } });

  return { id: reportId, deleted: true };
};
