const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const FREQUENCY_DEPARTMENTS = [
  "SEO",
  "Social Media",
  "Social Media Department",
];

const formatProject = (project) => {
  const department = project.department || { id: null, name: null };
  const createdBy =
    project.createdBy ||
    {
      id: null,
      employeeId: null,
      name: null,
      role: null,
    };

  return {
    id: project.id,
    projectName: project.projectName,
    description: project.description,
    department: {
      id: department.id,
      name: department.name,
    },
    startDate: project.startDate,
    endDate: project.endDate,
    renewalDate: project.renewalDate,
    frequency: project.frequency,
    clientName: project.clientName,
    location: project.location,
    phone: project.phone,
    fbEmail: project.fbEmail,
    fbPassword: project.fbPassword,
    instaEmail: project.instaEmail,
    instaPassword: project.instaPassword,
    referenceLink: project.referenceLink,
    tasteLink: project.tasteLink,
    linkedinEmail: project.linkedinEmail,
    linkedinPassword: project.linkedinPassword,
    youtubeEmail: project.youtubeEmail,
    youtubePassword: project.youtubePassword,
    twitterEmail: project.twitterEmail,
    twitterPassword: project.twitterPassword,
    logo: project.logo,
    projectStartDate: project.projectStartDate,
    createdBy: {
      id: createdBy.id,
      employeeId: createdBy.employeeId,
      name: createdBy.name,
      role: createdBy.role,
    },
    assignments: project.assignments
      .filter((assignment) => assignment.manager)
      .map((assignment) => ({
        id: assignment.id,
        assignedAt: assignment.assignedAt,
        manager: {
          id: assignment.manager.id,
          employeeId: assignment.manager.employeeId,
          name: assignment.manager.name,
          role: assignment.manager.role,
          position: assignment.manager.position,
        },
      })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

exports.createProject = async (user, body) => {
  if (!["ADMIN", "HR", "EA"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const department = await prisma.department.findUnique({
    where: { id: body.departmentId },
  });

  if (!department) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Department not found.",
    });
  }

  const isFrequencyDepartment = FREQUENCY_DEPARTMENTS.includes(department.name);
  const isSocialMediaDepartment = [
    "Social Media",
    "Social Media Department",
  ].includes(department.name);

  if (isFrequencyDepartment) {
    if (!body.frequency) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Frequency is required for SEO and Social Media departments.",
      });
    }

    if (!body.renewalDate) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Renewal date is required for SEO and Social Media departments.",
      });
    }

    if (new Date(body.renewalDate) <= new Date(body.endDate)) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Renewal date must be after the end date.",
      });
    }
  } else {
    if (body.frequency || body.renewalDate) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Frequency and renewal date are only allowed for SEO and Social Media departments.",
      });
    }
  }

  if (isSocialMediaDepartment) {
    // Social Media projects may be created before credentials are collected.
    // The assigned manager will fill these fields later.
  } else if (
    body.clientName ||
    body.location ||
    body.phone ||
    body.fbEmail ||
    body.fbPassword ||
    body.instaEmail ||
    body.instaPassword ||
    body.projectStartDate
  ) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message:
        "Social Media credential fields are only allowed for Social Media projects.",
    });
  }

  const uniqueAssignments = new Set(body.assignTo);

  if (uniqueAssignments.size !== body.assignTo.length) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Duplicate manager IDs are not allowed in assignTo.",
    });
  }

  const managers = await prisma.user.findMany({
    where: {
      employeeId: {
        in: body.assignTo,
      },
    },
  });

  let currentUser = null;

  if (user?.id) {
    currentUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
  }

  if (!currentUser && user?.employeeId) {
    currentUser = await prisma.user.findUnique({
      where: { employeeId: user.employeeId },
    });
  }

  if (!currentUser) {
    throw new ApiError(401, ERRORS.AUTH.UNAUTHORIZED);
  }

  user = currentUser;

  if (managers.length !== body.assignTo.length) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "One or more assigned managers were not found.",
    });
  }

  const invalidAssigned = managers.find(
    (manager) => manager.role !== "MANAGER"
  );

  if (invalidAssigned) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Assigned users must be managers.",
    });
  }

  const project = await prisma.project.create({
    data: {
      projectName: body.projectName,
      description: body.description || null,
      departmentId: body.departmentId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      frequency: body.frequency || null,
      clientName: body.clientName || null,
      location: body.location || null,
      phone: body.phone || null,
      fbEmail: body.fbEmail || null,
      fbPassword: body.fbPassword || null,
      instaEmail: body.instaEmail || null,
      instaPassword: body.instaPassword || null,
      projectStartDate: body.projectStartDate
        ? new Date(body.projectStartDate)
        : null,
      referenceLink: body.referenceLink || null,
      tasteLink: body.tasteLink || null,
      linkedinEmail: body.linkedinEmail || null,
      linkedinPassword: body.linkedinPassword || null,
      youtubeEmail: body.youtubeEmail || null,
      youtubePassword: body.youtubePassword || null,
      twitterEmail: body.twitterEmail || null,
      twitterPassword: body.twitterPassword || null,
      logo: body.logo || null,
      createdById: user.id,
      assignments: {
        create: managers.map((manager) => ({
          managerId: manager.id,
        })),
      },
    },
    include: {
      department: true,
      createdBy: true,
      assignments: {
        include: {
          manager: true,
        },
      },
    },
  });

  return formatProject(project);
};

exports.getProjects = async (user) => {
  const where =
    user.role === "MANAGER"
      ? { assignments: { some: { managerId: user.id } } }
      : undefined;

  if (!where && !["ADMIN", "HR", "EA"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      department: true,
      createdBy: true,
      assignments: {
        include: {
          manager: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map(formatProject);
};

exports.getAssignedProjects = async (user) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const projects = await prisma.project.findMany({
    where: {
      assignments: {
        some: {
          managerId: user.id,
        },
      },
    },
    include: {
      department: true,
      createdBy: true,
      assignments: {
        include: {
          manager: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map(formatProject);
};

exports.getProjectById = async (user, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      department: true,
      createdBy: true,
      assignments: {
        include: {
          manager: true,
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (user.role === "MANAGER") {
    const assigned = project.assignments.some(
      (assignment) => assignment.managerId === user.id
    );

    if (!assigned) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }
  } else if (!["ADMIN", "HR", "EA"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return formatProject(project);
};

exports.updateProject = async (user, projectId, body) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  if (user.role === "MANAGER") {
    const assigned = project.assignments.some(
      (assignment) => assignment.managerId === user.id
    );

    if (!assigned) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }

    const allowedManagerFields = new Set([
      "clientName",
      "location",
      "phone",
      "fbEmail",
      "fbPassword",
      "instaEmail",
      "instaPassword",
      "referenceLink",
      "tasteLink",
      "linkedinEmail",
      "linkedinPassword",
      "youtubeEmail",
      "youtubePassword",
      "twitterEmail",
      "twitterPassword",
      "logo",
      "projectStartDate",
    ]);

    const invalidFields = Object.keys(body).filter(
      (field) => !allowedManagerFields.has(field)
    );

    if (invalidFields.length > 0) {
      throw new ApiError(403, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message:
          "Managers can only update Social Media credential fields on assigned projects.",
      });
    }
  }

  let department = project.department;

  if (body.departmentId && body.departmentId !== project.departmentId) {
    department = await prisma.department.findUnique({
      where: { id: body.departmentId },
    });

    if (!department) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Department not found.",
      });
    }
  }

  const isFrequencyDepartment = FREQUENCY_DEPARTMENTS.includes(department.name);
  const isSocialMediaDepartment = [
    "Social Media",
    "Social Media Department",
  ].includes(department.name);
  const currentEndDate = body.endDate
    ? new Date(body.endDate)
    : project.endDate;
  const currentRenewalDate = body.renewalDate
    ? new Date(body.renewalDate)
    : project.renewalDate;

  if (isFrequencyDepartment) {
    if (currentRenewalDate && currentRenewalDate <= currentEndDate) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Renewal date must be after the end date.",
      });
    }

    if (
      body.departmentId &&
      !project.frequency &&
      !body.frequency &&
      !project.renewalDate &&
      !body.renewalDate
    ) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message:
          "Frequency and renewal date are required when moving a project into SEO or Social Media.",
      });
    }
  } else if (body.frequency || body.renewalDate) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message:
        "Frequency and renewal date are only allowed for SEO and Social Media departments.",
    });
  }

  const currentClientName =
    body.clientName !== undefined ? body.clientName : project.clientName;
  const currentLocation =
    body.location !== undefined ? body.location : project.location;
  const currentPhone =
    body.phone !== undefined ? body.phone : project.phone;
  const currentFbEmail =
    body.fbEmail !== undefined ? body.fbEmail : project.fbEmail;
  const currentFbPassword =
    body.fbPassword !== undefined ? body.fbPassword : project.fbPassword;
  const currentInstaEmail =
    body.instaEmail !== undefined ? body.instaEmail : project.instaEmail;
  const currentInstaPassword =
    body.instaPassword !== undefined
      ? body.instaPassword
      : project.instaPassword;
  const currentProjectStartDate =
    body.projectStartDate !== undefined
      ? body.projectStartDate
        ? new Date(body.projectStartDate)
        : null
      : project.projectStartDate;
  const currentReferenceLink =
    body.referenceLink !== undefined ? body.referenceLink : project.referenceLink;
  const currentTasteLink =
    body.tasteLink !== undefined ? body.tasteLink : project.tasteLink;
  const currentLinkedinEmail =
    body.linkedinEmail !== undefined ? body.linkedinEmail : project.linkedinEmail;
  const currentLinkedinPassword =
    body.linkedinPassword !== undefined ? body.linkedinPassword : project.linkedinPassword;
  const currentYoutubeEmail =
    body.youtubeEmail !== undefined ? body.youtubeEmail : project.youtubeEmail;
  const currentYoutubePassword =
    body.youtubePassword !== undefined ? body.youtubePassword : project.youtubePassword;
  const currentTwitterEmail =
    body.twitterEmail !== undefined ? body.twitterEmail : project.twitterEmail;
  const currentTwitterPassword =
    body.twitterPassword !== undefined ? body.twitterPassword : project.twitterPassword;
  const currentLogo = body.logo !== undefined ? body.logo : project.logo;

  if (isSocialMediaDepartment) {
    if (
      !currentClientName ||
      !currentLocation ||
      !currentPhone ||
      !currentFbEmail ||
      !currentFbPassword ||
      !currentInstaEmail ||
      !currentInstaPassword ||
      !currentProjectStartDate
    ) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message:
          "Social Media credential fields are required when the project department is Social Media.",
      });
    }
  } else if (
    body.clientName ||
    body.location ||
    body.phone ||
    body.fbEmail ||
    body.fbPassword ||
    body.instaEmail ||
    body.instaPassword ||
    body.projectStartDate
  ) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message:
        "Social Media credential fields are only allowed for Social Media projects.",
    });
  }

  const data = {};

  if (body.projectName !== undefined) data.projectName = body.projectName;
  if (body.description !== undefined)
    data.description = body.description || null;
  if (body.departmentId !== undefined) data.departmentId = body.departmentId;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.renewalDate !== undefined)
    data.renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;
  if (body.frequency !== undefined) data.frequency = body.frequency || null;
  if (body.clientName !== undefined) data.clientName = body.clientName || null;
  if (body.location !== undefined) data.location = body.location || null;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.fbEmail !== undefined) data.fbEmail = body.fbEmail || null;
  if (body.fbPassword !== undefined) data.fbPassword = body.fbPassword || null;
  if (body.instaEmail !== undefined) data.instaEmail = body.instaEmail || null;
  if (body.instaPassword !== undefined) data.instaPassword = body.instaPassword || null;
  if (body.referenceLink !== undefined)
    data.referenceLink = body.referenceLink || null;
  if (body.tasteLink !== undefined)
    data.tasteLink = body.tasteLink || null;
  if (body.linkedinEmail !== undefined)
    data.linkedinEmail = body.linkedinEmail || null;
  if (body.linkedinPassword !== undefined)
    data.linkedinPassword = body.linkedinPassword || null;
  if (body.youtubeEmail !== undefined)
    data.youtubeEmail = body.youtubeEmail || null;
  if (body.youtubePassword !== undefined)
    data.youtubePassword = body.youtubePassword || null;
  if (body.twitterEmail !== undefined)
    data.twitterEmail = body.twitterEmail || null;
  if (body.twitterPassword !== undefined)
    data.twitterPassword = body.twitterPassword || null;
  if (body.logo !== undefined) data.logo = body.logo || null;
  if (body.projectStartDate !== undefined)
    data.projectStartDate = body.projectStartDate
      ? new Date(body.projectStartDate)
      : null;

  if (!isFrequencyDepartment) {
    data.frequency = null;
    data.renewalDate = null;
  }

  if (!isSocialMediaDepartment) {
    data.clientName = null;
    data.location = null;
    data.phone = null;
    data.fbEmail = null;
    data.fbPassword = null;
    data.instaEmail = null;
    data.instaPassword = null;
    data.referenceLink = null;
    data.tasteLink = null;
    data.linkedinEmail = null;
    data.linkedinPassword = null;
    data.youtubeEmail = null;
    data.youtubePassword = null;
    data.twitterEmail = null;
    data.twitterPassword = null;
    data.logo = null;
    data.projectStartDate = null;
  }

  if (body.assignTo) {
    const uniqueAssignments = new Set(body.assignTo);

    if (uniqueAssignments.size !== body.assignTo.length) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Duplicate manager IDs are not allowed in assignTo.",
      });
    }

    const managers = await prisma.user.findMany({
      where: {
        employeeId: {
          in: body.assignTo,
        },
      },
    });

    if (managers.length !== body.assignTo.length) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "One or more assigned managers were not found.",
      });
    }

    const invalidAssigned = managers.find(
      (manager) => manager.role !== "MANAGER"
    );

    if (invalidAssigned) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Assigned users must be managers.",
      });
    }

    data.assignments = {
      deleteMany: {},
      create: managers.map((manager) => ({
        managerId: manager.id,
      })),
    };
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      department: true,
      createdBy: true,
      assignments: {
        include: {
          manager: true,
        },
      },
    },
  });

  return formatProject(updatedProject);
};

exports.deleteProject = async (user, projectId) => {
  if (!["ADMIN", "HR", "EA"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignments: true,
    },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (user.role === "MANAGER") {
    const assigned = project.assignments.some(
      (assignment) => assignment.managerId === user.id
    );

    if (!assigned) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return {
    id: projectId,
    deleted: true,
  };
};

exports.renewProject = async (user, projectId, body) => {
  if (!["ADMIN", "HR", "EA", "MANAGER"].includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  if (user.role === "MANAGER") {
    const assigned = project.assignments.some(
      (assignment) => assignment.managerId === user.id
    );

    if (!assigned) {
      throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
    }
  }

  if (!FREQUENCY_DEPARTMENTS.includes(project.department.name)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Only SEO and Social Media projects can be renewed.",
    });
  }

  const renewalDate = new Date(body.renewalDate);

  if (renewalDate <= project.endDate) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Renewal date must be after the current end date.",
    });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      endDate: renewalDate,
      renewalDate: renewalDate,
    },
    include: {
      department: true,
      createdBy: true,
      assignments: {
        include: {
          manager: true,
        },
      },
    },
  });

  return formatProject(updatedProject);
};
