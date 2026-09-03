const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const allowedViewerRoles = ["ADMIN", "HR", "EA", "MANAGER"];

const fail = (statusCode, message) => {
  throw new ApiError(statusCode, {
    code: ERRORS.VALIDATION.INVALID_INPUT.code,
    message,
  });
};

const formatCampaign = (campaign) => ({
  id: campaign.id,
  name: campaign.name,
  projectId: campaign.projectId,
  project: campaign.project
    ? {
        id: campaign.project.id,
        projectName: campaign.project.projectName,
        clientName: campaign.project.clientName,
      }
    : null,
  reports: campaign.reports,
  createdAt: campaign.createdAt,
  updatedAt: campaign.updatedAt,
});

const campaignInclude = {
  project: {
    select: { id: true, projectName: true, clientName: true },
  },
  reports: {
    orderBy: { date: "desc" },
  },
};

const getProject = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { department: true, assignments: true },
  });

  if (!project) fail(404, "Project not found.");
  if (!project.department?.name?.toLowerCase().includes("marketing")) {
    fail(400, "Campaigns are only supported for Marketing projects.");
  }
  return project;
};

const ensureProjectAccess = async (user, projectId) => {
  const project = await getProject(projectId);
  if (user.role === "MANAGER" && !project.assignments.some((a) => a.managerId === user.id)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  return project;
};

const ensureCampaignAccess = async (user, campaignId) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      ...campaignInclude,
      project: { include: { department: true, assignments: true } },
    },
  });

  if (!campaign) fail(404, "Campaign not found.");
  if (!campaign.project.department?.name?.toLowerCase().includes("marketing")) {
    fail(400, "Campaigns are only supported for Marketing projects.");
  }
  if (user.role === "MANAGER" && !campaign.project.assignments.some((a) => a.managerId === user.id)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  return campaign;
};

exports.createCampaign = async (user, projectId, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  await ensureProjectAccess(user, projectId);

  const existing = await prisma.campaign.findFirst({
    where: { projectId, name: { equals: body.name.trim(), mode: "insensitive" } },
  });
  if (existing) fail(409, "A campaign with this name already exists in the project.");

  const campaign = await prisma.campaign.create({
    data: { projectId, name: body.name.trim() },
    include: campaignInclude,
  });
  return formatCampaign(campaign);
};

exports.getCampaigns = async (user, projectId) => {
  if (!allowedViewerRoles.includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  await ensureProjectAccess(user, projectId);
  const campaigns = await prisma.campaign.findMany({
    where: { projectId },
    include: campaignInclude,
    orderBy: { createdAt: "asc" },
  });
  return campaigns.map(formatCampaign);
};

exports.getCampaign = async (user, campaignId) => {
  if (!allowedViewerRoles.includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  return formatCampaign(await ensureCampaignAccess(user, campaignId));
};

exports.updateCampaign = async (user, campaignId, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  const campaign = await ensureCampaignAccess(user, campaignId);
  const duplicate = await prisma.campaign.findFirst({
    where: {
      projectId: campaign.projectId,
      name: { equals: body.name.trim(), mode: "insensitive" },
      NOT: { id: campaignId },
    },
  });
  if (duplicate) fail(409, "A campaign with this name already exists in the project.");

  return formatCampaign(await prisma.campaign.update({
    where: { id: campaignId },
    data: { name: body.name.trim() },
    include: campaignInclude,
  }));
};

exports.deleteCampaign = async (user, campaignId) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  const campaign = await ensureCampaignAccess(user, campaignId);
  if (campaign.reports.length > 0) {
    fail(409, "Cannot delete a campaign that already has reports.");
  }
  await prisma.campaign.delete({ where: { id: campaignId } });
  return { id: campaignId, deleted: true };
};
