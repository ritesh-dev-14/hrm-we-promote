const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const {
  sendShootTaskAssignedToEmployeeMail,
  sendSubmissionMailToManager,
  sendApprovalMailToEmployee,
  sendRejectionMailToEmployee,
} = require("../mail/mail.service");


const getWorkspace = async (workspaceId) => {
  return prisma.shootWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      createdBy: true,
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: {
          subtasks: true,
        },
      },
    },
  });
};

const formatWorkspace = (workspace) => ({
  id: workspace.id,
  name: workspace.name,
  description: workspace.description,
  createdBy: {
    id: workspace.createdBy.id,
    employeeId: workspace.createdBy.employeeId,
    name: workspace.createdBy.name,
    email: workspace.createdBy.email,
  },
  members: workspace.members.map((member) => ({
    id: member.user.id,
    employeeId: member.user.employeeId,
    name: member.user.name,
    email: member.user.email,
    role: member.user.role,
  })),
  tasks: workspace.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    noOfPics: task.noOfPics,
    noOfReels: task.noOfReels,
    date: task.date,
    arrivalTime: task.arrivalTime,
    location: task.location,
    setupType: task.setupType,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtaskCount: task.subtasks?.length ?? 0,
  })),
  createdAt: workspace.createdAt,
  updatedAt: workspace.updatedAt,
});

const verifyWorkspaceOwnership = async (user, workspaceId) => {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot workspace not found.",
    });
  }
  if (workspace.createdById !== user.id) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }
  return workspace;
};

const verifyWorkspaceAccess = async (user, workspaceId) => {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot workspace not found.",
    });
  }

  const isMember = workspace.members.some((member) => member.userId === user.id);
  const canView = ["ADMIN", "HR", "MANAGER"].includes(user.role) || isMember;
  if (!canView) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return workspace;
};

exports.createShootWorkspace = async (user, body) => {
  const workspace = await prisma.shootWorkspace.create({
    data: {
      name: body.brandName,
      description: body.description || null,
      createdById: user.id,
      members: {
        create: [],
      },
    },
    include: { createdBy: true, members: { include: { user: true } }, tasks: true },
  });
  return formatWorkspace(workspace);
};

exports.getShootWorkspaces = async (user) => {
  const taskInclude = { include: { subtasks: true } };

  if (["ADMIN", "HR"].includes(user.role)) {
    const workspaces = await prisma.shootWorkspace.findMany({
      include: { createdBy: true, members: { include: { user: true } }, tasks: taskInclude },
      orderBy: { createdAt: "desc" },
    });
    return workspaces.map(formatWorkspace);
  }

  if (user.role === "MANAGER") {
    const workspaces = await prisma.shootWorkspace.findMany({
      where: { createdById: user.id },
      include: { createdBy: true, members: { include: { user: true } }, tasks: taskInclude },
      orderBy: { createdAt: "desc" },
    });
    return workspaces.map(formatWorkspace);
  }

  const workspaces = await prisma.shootWorkspace.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { createdBy: true, members: { include: { user: true } }, tasks: taskInclude },
    orderBy: { createdAt: "desc" },
  });

  return workspaces.map(formatWorkspace);
};

exports.getShootWorkspaceById = async (user, workspaceId) => {
  const workspace = await verifyWorkspaceAccess(user, workspaceId);
  return formatWorkspace(workspace);
};

exports.updateShootWorkspace = async (user, workspaceId, body) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const workspace = await prisma.shootWorkspace.update({
    where: { id: workspaceId },
    data: {
      ...(body.brandName !== undefined ? { name: body.brandName } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
    include: { createdBy: true, members: { include: { user: true } }, tasks: true },
  });

  return formatWorkspace(workspace);
};

exports.deleteShootWorkspace = async (user, workspaceId) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const workspace = await prisma.shootWorkspace.delete({
    where: { id: workspaceId },
  });

  return { id: workspace.id, deleted: true };
};

exports.addShootWorkspaceMembers = async (user, workspaceId, body) => {
  const workspace = await verifyWorkspaceOwnership(user, workspaceId);

  const employees = await prisma.user.findMany({
    where: {
      employeeId: { in: body.employeeIds },
      role: "EMPLOYEE",
    },
  });

  if (employees.length !== body.employeeIds.length) {
    throw new ApiError(400, {
      code: ERRORS.TASK.EMPLOYEE_NOT_FOUND.code,
      message: ERRORS.TASK.EMPLOYEE_NOT_FOUND.message,
    });
  }

  const existingMembers = await prisma.shootWorkspaceMember.findMany({
    where: {
      workspaceId,
      userId: { in: employees.map((emp) => emp.id) },
    },
  });

  const existingUserIds = existingMembers.map((member) => member.userId);
  const newMembers = employees.filter((emp) => !existingUserIds.includes(emp.id));

  if (newMembers.length > 0) {
    await prisma.shootWorkspaceMember.createMany({
      data: newMembers.map((emp) => ({
        workspaceId,
        userId: emp.id,
      })),
      skipDuplicates: true,
    });
  }

  const updatedWorkspace = await getWorkspace(workspace.id);

  // 🔥 Send email to each newly added member (fire-and-forget)
  if (newMembers.length > 0) {
    const managerUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    for (const emp of newMembers) {
      if (emp.email) {
        sendShootTaskAssignedToEmployeeMail({
          email: emp.email,
          employeeName: emp.name,
          managerName: managerUser?.name || null,
          workspaceName: workspace.name,
          taskTitle: null,
          taskDate: null,
          taskLocation: null,
          description: workspace.description || null,
        }).catch((err) =>
          console.error(`[Mail] Failed to send shoot workspace email to ${emp.email}:`, err.message)
        );
      }
    }
  }

  return formatWorkspace(updatedWorkspace);
};

exports.removeShootWorkspaceMember = async (user, workspaceId, memberId) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const member = await prisma.shootWorkspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
  });

  if (!member) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Workspace member not found.",
    });
  }

  await prisma.shootWorkspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
  });

  const workspace = await getWorkspace(workspaceId);
  return formatWorkspace(workspace);
};

exports.createShootTask = async (user, workspaceId, body) => {
  const workspace = await verifyWorkspaceOwnership(user, workspaceId);

  const task = await prisma.shootTask.create({
    data: {
      workspaceId: workspace.id,
      title: body.title,
      description: body.description || null,
      noOfPics: body.noOfPics,
      noOfReels: body.noOfReels,
      date: body.date ?? null,
      arrivalTime: body.arrivalTime ?? null,
      location: body.location ?? null,
      setupType: body.setupType ?? null,
      createdById: user.id,
    },
    include: { subtasks: true },
  });

  return {
    id: task.id,
    workspaceId: task.workspaceId,
    title: task.title,
    description: task.description,
    noOfPics: task.noOfPics,
    noOfReels: task.noOfReels,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      dayId: subtask.dayId,
      title: subtask.title,
      description: subtask.description,
      type: subtask.type,
      referenceLinks: subtask.referenceLinks,
      videoType: subtask.videoType,
      setupType: subtask.setupType,
      submissionLinks: subtask.submissionLinks,
      unableToSubmitReason: subtask.unableToSubmitReason,
      submittedById: subtask.submittedById,
      submittedAt: subtask.submittedAt,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    })),
  };
};

exports.getShootTasks = async (user, workspaceId) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const tasks = await prisma.shootTask.findMany({
    where: { workspaceId },
    include: { subtasks: true },
    orderBy: { createdAt: "desc" },
  });

  return tasks.map((task) => ({
    id: task.id,
    workspaceId: task.workspaceId,
    title: task.title,
    description: task.description,
    noOfPics: task.noOfPics,
    noOfReels: task.noOfReels,
    date: task.date,
    arrivalTime: task.arrivalTime,
    location: task.location,
    setupType: task.setupType,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      dayId: subtask.dayId,
      title: subtask.title,
      description: subtask.description,
      type: subtask.type,
      referenceLinks: subtask.referenceLinks,
      videoType: subtask.videoType,
      setupType: subtask.setupType,
      submissionLinks: subtask.submissionLinks,
      unableToSubmitReason: subtask.unableToSubmitReason,
      submittedById: subtask.submittedById,
      submittedAt: subtask.submittedAt,
      status: subtask.status,
      reviewReason: subtask.reviewReason,
      reviewedById: subtask.reviewedById,
      reviewedAt: subtask.reviewedAt,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    })),
  }));
};

exports.getMyShootTasks = async (user) => {
  const where =
    ["ADMIN", "HR"].includes(user.role)
      ? undefined
      : user.role === "MANAGER"
      ? { workspace: { createdById: user.id } }
      : { workspace: { members: { some: { userId: user.id } } } };

  const tasks = await prisma.shootTask.findMany({
    where,
    include: {
      workspace: true,
      subtasks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return tasks.map((task) => ({
    id: task.id,
    workspaceId: task.workspaceId,
    workspaceName: task.workspace?.name ?? null,
    title: task.title,
    description: task.description,
    noOfPics: task.noOfPics,
    noOfReels: task.noOfReels,
    date: task.date,
    arrivalTime: task.arrivalTime,
    location: task.location,
    setupType: task.setupType,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      dayId: subtask.dayId,
      title: subtask.title,
      description: subtask.description,
      type: subtask.type,
      referenceLinks: subtask.referenceLinks,
      videoType: subtask.videoType,
      setupType: subtask.setupType,
      submissionLinks: subtask.submissionLinks,
      unableToSubmitReason: subtask.unableToSubmitReason,
      submittedById: subtask.submittedById,
      submittedAt: subtask.submittedAt,
      status: subtask.status,
      reviewReason: subtask.reviewReason,
      reviewedById: subtask.reviewedById,
      reviewedAt: subtask.reviewedAt,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    })),
  }));
};

exports.getShootTaskById = async (user, workspaceId, taskId) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const task = await prisma.shootTask.findFirst({
    where: { id: taskId, workspaceId },
    include: { subtasks: true },
  });

  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  return {
    id: task.id,
    workspaceId: task.workspaceId,
    title: task.title,
    description: task.description,
    noOfPics: task.noOfPics,
    noOfReels: task.noOfReels,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.description,
      type: subtask.type,
      referenceLinks: subtask.referenceLinks,
      videoType: subtask.videoType,
      setupType: subtask.setupType,
      submissionLinks: subtask.submissionLinks,
      unableToSubmitReason: subtask.unableToSubmitReason,
      submittedById: subtask.submittedById,
      submittedAt: subtask.submittedAt,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    })),
  };
};

exports.updateShootTask = async (user, workspaceId, taskId, body) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const task = await prisma.shootTask.findFirst({ where: { id: taskId, workspaceId } });
  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  const updatedTask = await prisma.shootTask.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.noOfPics !== undefined ? { noOfPics: body.noOfPics } : {}),
      ...(body.noOfReels !== undefined ? { noOfReels: body.noOfReels } : {}),
      ...(body.date !== undefined ? { date: body.date ?? null } : {}),
      ...(body.arrivalTime !== undefined ? { arrivalTime: body.arrivalTime ?? null } : {}),
      ...(body.location !== undefined ? { location: body.location ?? null } : {}),
      ...(body.setupType !== undefined ? { setupType: body.setupType ?? null } : {}),
    },
    include: { subtasks: true },
  });

  return {
    id: updatedTask.id,
    workspaceId: updatedTask.workspaceId,
    title: updatedTask.title,
    description: updatedTask.description,
    noOfPics: updatedTask.noOfPics,
    noOfReels: updatedTask.noOfReels,
    date: updatedTask.date,
    arrivalTime: updatedTask.arrivalTime,
    location: updatedTask.location,
    setupType: updatedTask.setupType,
    createdById: updatedTask.createdById,
    createdAt: updatedTask.createdAt,
    updatedAt: updatedTask.updatedAt,
    subtasks: updatedTask.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      type: subtask.type,
      videoType: subtask.videoType,
      setupType: subtask.setupType,
    })),
  };
};

exports.deleteShootTask = async (user, workspaceId, taskId) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const task = await prisma.shootTask.findFirst({ where: { id: taskId, workspaceId } });
  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  await prisma.shootTask.delete({ where: { id: taskId } });
  return { id: taskId, deleted: true };
};

exports.createShootSubTask = async (user, workspaceId, taskId, body) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const task = await prisma.shootTask.findFirst({ where: { id: taskId, workspaceId } });
  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  // 🔥 Validate dayId if provided
  let validDayId = null;
  if (body.dayId) {
    const day = await prisma.projectMonthlySheetDay.findUnique({
      where: { id: body.dayId },
    });

    if (!day) {
      throw new ApiError(404, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Monthly sheet day not found.",
      });
    }

    validDayId = body.dayId;
  }

  const subtask = await prisma.shootSubTask.create({
    data: {
      taskId,
      dayId: validDayId,
      title: body.title,
      description: body.description || null,
      type: body.type,
      referenceLinks: body.referenceLinks,
      videoType: body.videoType,
      setupType: body.setupType ?? null,
      status: "DRAFT",
    },
  });

  const result = {
    id: subtask.id,
    taskId: subtask.taskId,
    dayId: subtask.dayId,
    title: subtask.title,
    description: subtask.description,
    type: subtask.type,
    referenceLinks: subtask.referenceLinks,
    videoType: subtask.videoType,
    setupType: subtask.setupType,
    status: subtask.status,
    createdAt: subtask.createdAt,
    updatedAt: subtask.updatedAt,
  };

  // 🔥 Notify all workspace members about the new shoot subtask (fire-and-forget)
  try {
    const workspace = await prisma.shootWorkspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (workspace && workspace.members.length > 0) {
      const managerUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });

      const taskDateStr = task.date
        ? new Date(task.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : null;

      for (const member of workspace.members) {
        if (member.user.email) {
          sendShootTaskAssignedToEmployeeMail({
            email: member.user.email,
            employeeName: member.user.name,
            managerName: managerUser?.name || null,
            workspaceName: workspace.name,
            taskTitle: subtask.title,
            taskDate: taskDateStr,
            taskLocation: task.location || null,
            description: subtask.description || null,
          }).catch((err) =>
            console.error(`[Mail] Failed to send shoot subtask email to ${member.user.email}:`, err.message)
          );
        }
      }
    }
  } catch (mailErr) {
    console.error("[Mail] Error fetching workspace members for shoot subtask email:", mailErr.message);
  }

  return result;
};

exports.submitShootSubTask = async (user, workspaceId, taskId, subtaskId, body) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const subtask = await prisma.shootSubTask.findFirst({
    where: {
      id: subtaskId,
      taskId,
    },
  });

  if (!subtask) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot subtask not found.",
    });
  }

  if (subtask.status === "SUBMITTED" || subtask.status === "APPROVED") {
    throw new ApiError(400, {
      code: ERRORS.TASK.ALREADY_SUBMITTED.code,
      message: ERRORS.TASK.ALREADY_SUBMITTED.message,
    });
  }

  const updatedSubtask = await prisma.shootSubTask.update({
    where: { id: subtaskId },
    data: {
      submissionLinks: body.submissionLinks ?? [],
      unableToSubmitReason: body.unableToSubmitReason ?? null,
      submittedById: user.id,
      submittedAt: new Date(),
      status: body.submissionLinks ? "SUBMITTED" : "UNABLE_TO_SUBMIT",
      reviewReason: null,
      reviewedAt: null,
      reviewedById: null,
    },
  });

  // 🔥 Email the workspace creator (manager) that employee submitted (fire-and-forget)
  if (body.submissionLinks && body.submissionLinks.length > 0) {
    prisma.shootWorkspace.findUnique({
      where: { id: workspaceId },
      include: { createdBy: true },
    }).then(async (workspace) => {
      if (!workspace?.createdBy?.email) return;
      const manager = workspace.createdBy;
      const emp = await prisma.user.findUnique({ where: { id: user.id } });
      return sendSubmissionMailToManager({
        email: manager.email,
        managerName: manager.name,
        employeeName: emp?.name || "Employee",
        taskTitle: updatedSubtask.title,
        remarks: `Shoot subtask submission in workspace: ${workspace.name}`,
        driveLink: (body.submissionLinks || []).join(", "),
      });
    }).catch((err) =>
      console.error("[Mail] Failed to send shoot submission email to manager:", err.message)
    );
  }

  return {
    id: updatedSubtask.id,
    taskId: updatedSubtask.taskId,
    dayId: updatedSubtask.dayId,
    title: updatedSubtask.title,
    description: updatedSubtask.description,
    type: updatedSubtask.type,
    referenceLinks: updatedSubtask.referenceLinks,
    videoType: updatedSubtask.videoType,
    setupType: updatedSubtask.setupType,
    submissionLinks: updatedSubtask.submissionLinks,
    unableToSubmitReason: updatedSubtask.unableToSubmitReason,
    submittedById: updatedSubtask.submittedById,
    submittedAt: updatedSubtask.submittedAt,
    status: updatedSubtask.status,
    reviewReason: updatedSubtask.reviewReason,
    reviewedById: updatedSubtask.reviewedById,
    reviewedAt: updatedSubtask.reviewedAt,
    createdAt: updatedSubtask.createdAt,
    updatedAt: updatedSubtask.updatedAt,
  };
};

exports.reviewShootSubTask = async (user, workspaceId, taskId, subtaskId, body) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const subtask = await prisma.shootSubTask.findFirst({
    where: {
      id: subtaskId,
      taskId,
    },
    include: { day: true },
  });

  if (!subtask) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot subtask not found.",
    });
  }

  if (subtask.status !== "SUBMITTED") {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Only submitted subtasks can be reviewed.",
    });
  }

  const updatedSubtask = await prisma.shootSubTask.update({
    where: { id: subtaskId },
    data: {
      status: body.status,
      reviewReason: body.reviewReason || null,
      reviewedById: user.id,
      reviewedAt: new Date(),
    },
  });

  // 🔥 When approved, update the monthly sheet day with submission links
  if (body.status === "APPROVED" && subtask.dayId && subtask.submissionLinks.length > 0) {
    // Get the current day's submissionLinks
    const day = await prisma.projectMonthlySheetDay.findUnique({
      where: { id: subtask.dayId },
    });

    if (day) {
      // Merge existing submission links with new ones (avoid duplicates)
      const mergedLinks = Array.from(
        new Set([...day.submissionLinks, ...subtask.submissionLinks])
      );

      // Update the day with merged submission links
      await prisma.projectMonthlySheetDay.update({
        where: { id: subtask.dayId },
        data: {
          submissionLinks: mergedLinks,
        },
      });
    }
  }

  // 🔥 Email the employee who submitted about the review result (fire-and-forget)
  if (subtask.submittedById) {
    prisma.user.findUnique({ where: { id: subtask.submittedById } })
      .then((emp) => {
        if (!emp?.email) return;
        if (body.status === "APPROVED") {
          return sendApprovalMailToEmployee({
            email: emp.email,
            employeeName: emp.name,
            taskTitle: subtask.title,
          });
        } else if (body.status === "REJECTED") {
          return sendRejectionMailToEmployee({
            email: emp.email,
            employeeName: emp.name,
            taskTitle: subtask.title,
            reason: body.reviewReason || "No details provided",
          });
        }
      })
      .catch((err) =>
        console.error("[Mail] Failed to send shoot review email to employee:", err.message)
      );
  }

  return {
    id: updatedSubtask.id,
    taskId: updatedSubtask.taskId,
    dayId: updatedSubtask.dayId,
    title: updatedSubtask.title,
    description: updatedSubtask.description,
    type: updatedSubtask.type,
    referenceLinks: updatedSubtask.referenceLinks,
    videoType: updatedSubtask.videoType,
    setupType: updatedSubtask.setupType,
    submissionLinks: updatedSubtask.submissionLinks,
    unableToSubmitReason: updatedSubtask.unableToSubmitReason,
    submittedById: updatedSubtask.submittedById,
    submittedAt: updatedSubtask.submittedAt,
    status: updatedSubtask.status,
    reviewReason: updatedSubtask.reviewReason,
    reviewedById: updatedSubtask.reviewedById,
    reviewedAt: updatedSubtask.reviewedAt,
    createdAt: updatedSubtask.createdAt,
    updatedAt: updatedSubtask.updatedAt,
  };
};

exports.getShootSubTasks = async (user, workspaceId, taskId) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const subtasks = await prisma.shootSubTask.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });

  return subtasks.map((subtask) => ({
    id: subtask.id,
    taskId: subtask.taskId,
    dayId: subtask.dayId,
    title: subtask.title,
    description: subtask.description,
    type: subtask.type,
    referenceLinks: subtask.referenceLinks,
    videoType: subtask.videoType,
    setupType: subtask.setupType,
    submissionLinks: subtask.submissionLinks,
    unableToSubmitReason: subtask.unableToSubmitReason,
    submittedById: subtask.submittedById,
    submittedAt: subtask.submittedAt,
    status: subtask.status,
    reviewReason: subtask.reviewReason,
    reviewedById: subtask.reviewedById,
    reviewedAt: subtask.reviewedAt,
    createdAt: subtask.createdAt,
    updatedAt: subtask.updatedAt,
  }));
};

exports.getShootSubTaskById = async (user, workspaceId, taskId, subtaskId) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const subtask = await prisma.shootSubTask.findFirst({
    where: { id: subtaskId, taskId },
  });

  if (!subtask) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot subtask not found.",
    });
  }

  return {
    id: subtask.id,
    taskId: subtask.taskId,
    dayId: subtask.dayId,
    title: subtask.title,
    description: subtask.description,
    type: subtask.type,
    referenceLinks: subtask.referenceLinks,
    videoType: subtask.videoType,
    setupType: subtask.setupType,
    submissionLinks: subtask.submissionLinks,
    unableToSubmitReason: subtask.unableToSubmitReason,
    submittedById: subtask.submittedById,
    submittedAt: subtask.submittedAt,
    status: subtask.status,
    reviewReason: subtask.reviewReason,
    reviewedById: subtask.reviewedById,
    reviewedAt: subtask.reviewedAt,
    createdAt: subtask.createdAt,
    updatedAt: subtask.updatedAt,
  };
};

exports.updateShootSubTask = async (user, workspaceId, taskId, subtaskId, body) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const subtask = await prisma.shootSubTask.findFirst({
    where: { id: subtaskId, taskId },
  });

  if (!subtask) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot subtask not found.",
    });
  }

  const updatedSubtask = await prisma.shootSubTask.update({
    where: { id: subtaskId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.referenceLinks !== undefined ? { referenceLinks: body.referenceLinks } : {}),
      ...(body.videoType !== undefined ? { videoType: body.videoType } : {}),
      ...(body.setupType !== undefined ? { setupType: body.setupType ?? null } : {}),
    },
  });

  return {
    id: updatedSubtask.id,
    taskId: updatedSubtask.taskId,
    dayId: updatedSubtask.dayId,
    title: updatedSubtask.title,
    description: updatedSubtask.description,
    type: updatedSubtask.type,
    referenceLinks: updatedSubtask.referenceLinks,
    videoType: updatedSubtask.videoType,
    setupType: updatedSubtask.setupType,
    submissionLinks: updatedSubtask.submissionLinks,
    unableToSubmitReason: updatedSubtask.unableToSubmitReason,
    submittedById: updatedSubtask.submittedById,
    submittedAt: updatedSubtask.submittedAt,
    status: updatedSubtask.status,
    reviewReason: updatedSubtask.reviewReason,
    reviewedById: updatedSubtask.reviewedById,
    reviewedAt: updatedSubtask.reviewedAt,
    createdAt: updatedSubtask.createdAt,
    updatedAt: updatedSubtask.updatedAt,
  };
};

exports.deleteShootSubTask = async (user, workspaceId, taskId, subtaskId) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const subtask = await prisma.shootSubTask.findFirst({
    where: { id: subtaskId, taskId },
  });

  if (!subtask) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Shoot subtask not found.",
    });
  }

  await prisma.shootSubTask.delete({ where: { id: subtaskId } });
  return { id: subtaskId, deleted: true };
};
