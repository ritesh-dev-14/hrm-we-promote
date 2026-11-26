const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const { getChecklistItems } = require("./project-onboarding.checklist");

const ALLOWED_ROLES = ["ADMIN", "HR", "COORDINATOR"];

const getUserRoles = (user) => (user.roles?.length ? user.roles : [user.role])
  .filter(Boolean)
  .map((role) => String(role).toUpperCase());

const assertCanAccessProject = async (user, projectId) => {
  const userRoles = getUserRoles(user);
  if (!userRoles.some((role) => ALLOWED_ROLES.includes(role))) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      department: { select: { name: true } },
    },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (!getChecklistItems(project.department.name).length) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project onboarding is only available for SEO, Marketing, and Social Media projects.",
    });
  }

  return project;
};

const formatProjectChecklist = (project) => {
  const configuredItems = getChecklistItems(project.department.name);
  const savedItems = new Map(project.onboardingItems.map((item) => [item.itemKey, item]));

  return {
    id: project.id,
    projectName: project.projectName,
    clientName: project.clientName,
    department: project.department.name,
    createdAt: project.createdAt,
    items: configuredItems.map((item) => {
      const savedItem = savedItems.get(item.key);
      const deadline = new Date(project.createdAt);
      deadline.setDate(deadline.getDate() + item.dueDays);
      return {
        ...item,
        deadline,
        completed: savedItem?.completed || false,
        completedAt: savedItem?.completedAt || null,
      };
    }),
  };
};

exports.getProjectOnboarding = async (user) => {
  const userRoles = getUserRoles(user);
  if (!userRoles.some((role) => ALLOWED_ROLES.includes(role))) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { department: { name: { contains: "social", mode: "insensitive" } } },
        { department: { name: { contains: "seo", mode: "insensitive" } } },
        { department: { name: { contains: "marketing", mode: "insensitive" } } },
        { department: { name: { contains: "meta", mode: "insensitive" } } },
      ],
    },
    include: {
      department: { select: { name: true } },
      onboardingItems: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return projects
    .filter((project) => getChecklistItems(project.department.name).length > 0)
    .map(formatProjectChecklist);
};

exports.updateProjectOnboardingItem = async (user, projectId, itemKey, completed) => {
  const project = await assertCanAccessProject(user, projectId);
  const checklistItem = getChecklistItems(project.department.name)
    .find((item) => item.key === itemKey);

  if (!checklistItem) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Checklist item is not valid for this project.",
    });
  }

  const savedItem = await prisma.projectOnboardingItem.upsert({
    where: {
      projectId_itemKey: { projectId, itemKey },
    },
    create: {
      projectId,
      itemKey,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  return {
    key: savedItem.itemKey,
    completed: savedItem.completed,
    completedAt: savedItem.completedAt,
  };
};
