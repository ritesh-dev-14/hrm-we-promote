const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const managerSelect = { id: true, name: true, employeeId: true, role: true };

const fail = (status, message) => {
  throw new ApiError(status, { code: ERRORS.VALIDATION.INVALID_INPUT.code, message });
};

const asNumber = (value, name, integer = false) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = integer ? Number.parseInt(value, 10) : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) fail(400, `${name} must be a valid number.`);
  return parsed;
};

const asBoolean = (value, name) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["yes", "true"].includes(normalized)) return true;
  if (["no", "false"].includes(normalized)) return false;
  fail(400, `${name} must be yes or no.`);
};

const getProjects = () => prisma.project.findMany({
  where: { department: { name: { contains: "marketing", mode: "insensitive" } } },
  select: { id: true, projectName: true, clientName: true, department: { select: { id: true, name: true } } },
  orderBy: { projectName: "asc" },
});

const includeReport = {
  manager: { select: managerSelect },
  rows: { include: { project: { select: { id: true, projectName: true, clientName: true } } }, orderBy: { createdAt: "asc" } },
  remarks: { include: { manager: { select: managerSelect } }, orderBy: { createdAt: "asc" } },
};

const format = (report) => ({ ...report, rows: report.rows, remarks: report.remarks });

const validatePeriod = (month, year) => {
  const parsedMonth = Number.parseInt(month, 10);
  const parsedYear = Number.parseInt(year, 10);
  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) fail(400, "month must be an integer from 1 to 12.");
  if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) fail(400, "year must be a valid four-digit year.");
  return { month: parsedMonth, year: parsedYear };
};

const normalizeRows = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) fail(400, "At least one campaign row is required.");
  const projects = await getProjects();
  if (projects.length === 0) {
    fail(400, "No Marketing department projects exist. Create a Marketing project first.");
  }

  return rows.map((row, index) => {
    const projectName = String(row.projectName || row.clientName || "").trim().toLowerCase();
    const project = projects.find((candidate) =>
      candidate.id === row.projectId ||
      (projectName && [candidate.projectName, candidate.clientName]
        .filter(Boolean)
        .some((value) => value.trim().toLowerCase() === projectName))
    );

    if (!project) {
      fail(400, `rows[${index}] must contain a valid projectId or projectName from the Marketing projects list.`);
    }
    return {
      projectId: project.id,
      clientName: project.clientName || project.projectName,
      currentlyRunning: asBoolean(row.currentlyRunning, `rows[${index}].currentlyRunning`),
      awarenessEnabled: asBoolean(row.awarenessEnabled, `rows[${index}].awarenessEnabled`),
      awarenessArea: row.awarenessArea || null,
      awarenessFunds: asNumber(row.awarenessFunds, `rows[${index}].awarenessFunds`),
      leadAdsEnabled: asBoolean(row.leadAdsEnabled, `rows[${index}].leadAdsEnabled`),
      leadsFund: asNumber(row.leadsFund, `rows[${index}].leadsFund`),
      leadArea: row.leadArea || null,
      requiredLeads: asNumber(row.requiredLeads, `rows[${index}].requiredLeads`, true),
      adsStartingDate: row.adsStartingDate ? new Date(row.adsStartingDate) : null,
      monthlyBudget: asNumber(row.monthlyBudget, `rows[${index}].monthlyBudget`),
    };
  });
};

const assertRole = (user, roles) => {
  if (!roles.includes(user.role)) throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
};

exports.getMarketingProjects = async (user) => {
  assertRole(user, ["ADMIN", "HR", "EA", "MANAGER"]);
  return getProjects();
};

exports.createMarketingMonthlyReport = async (user, body) => {
  assertRole(user, ["MANAGER"]);
  const { month, year } = validatePeriod(body.month, body.year);
  const rows = await normalizeRows(body.rows);
  const existing = await prisma.marketingMonthlyReport.findUnique({ where: { month_year: { month, year } } });
  if (existing) fail(409, "A marketing monthly report already exists for this month and year.");
  const report = await prisma.marketingMonthlyReport.create({
    data: { managerId: user.id, month, year, rows: { create: rows } }, include: includeReport,
  });
  return format(report);
};

exports.getMarketingMonthlyReport = async (user, month, year) => {
  assertRole(user, ["ADMIN", "HR", "EA", "MANAGER"]);
  const period = validatePeriod(month, year);
  const report = await prisma.marketingMonthlyReport.findUnique({ where: { month_year: period }, include: includeReport });
  return report ? format(report) : null;
};

exports.updateMarketingMonthlyReport = async (user, reportId, body) => {
  assertRole(user, ["MANAGER"]);
  const existing = await prisma.marketingMonthlyReport.findUnique({ where: { id: reportId } });
  if (!existing) fail(404, "Marketing monthly report not found.");
  const rows = await normalizeRows(body.rows);
  const report = await prisma.$transaction(async (tx) => {
    await tx.marketingMonthlyReportRow.deleteMany({ where: { reportId } });
    return tx.marketingMonthlyReport.update({ where: { id: reportId }, data: { rows: { create: rows } }, include: includeReport });
  });
  return format(report);
};

exports.addRemark = async (user, reportId, body) => {
  assertRole(user, ["MANAGER"]);
  if (!body.remark || !String(body.remark).trim()) fail(400, "remark is required.");
  const report = await prisma.marketingMonthlyReport.findUnique({ where: { id: reportId } });
  if (!report) fail(404, "Marketing monthly report not found.");
  return prisma.marketingMonthlyReportRemark.create({ data: { reportId, managerId: user.id, remark: String(body.remark).trim() }, include: { manager: { select: managerSelect } } });
};

exports.deleteRemark = async (user, remarkId) => {
  assertRole(user, ["MANAGER"]);
  const remark = await prisma.marketingMonthlyReportRemark.findUnique({ where: { id: remarkId }, include: { report: true } });
  if (!remark) fail(404, "Remark not found.");
  await prisma.marketingMonthlyReportRemark.delete({ where: { id: remarkId } });
  return { id: remarkId, deleted: true };
};
