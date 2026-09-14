const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const {
  sendShootTaskAssignedToEmployeeMail,
  sendSubmissionMailToManager,
  sendApprovalMailToEmployee,
  sendRejectionMailToEmployee,
} = require("../mail/mail.service");
const { incrementUnread } = require("../../services/sidebarUnread.service");

const assignedEmployeeSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  role: true,
};

const shootTaskInclude = {
  subtasks: true,
  extraContent: {
    include: {
      submittedBy: { select: assignedEmployeeSelect },
    },
    orderBy: { submittedAt: "desc" },
  },
  assignments: {
    include: { user: { select: assignedEmployeeSelect } },
  },
};

const formatExtraContent = (content) => ({
  id: content.id,
  taskId: content.taskId,
  extraPics: content.extraPics,
  extraReels: content.extraReels,
  driveLink: content.driveLink,
  notes: content.notes,
  submittedAt: content.submittedAt,
  submittedBy: content.submittedBy
    ? {
        id: content.submittedBy.id,
        employeeId: content.submittedBy.employeeId,
        name: content.submittedBy.name,
      }
    : null,
});

const formatShootTask = (task) => ({
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
  assignedEmployees: (task.assignments || []).map((assignment) => ({
    assignedAt: assignment.assignedAt,
    ...assignment.user,
  })),
  extraContent: (task.extraContent || []).map(formatExtraContent),
  extraPics: (task.extraContent || []).reduce((total, item) => total + item.extraPics, 0),
  extraReels: (task.extraContent || []).reduce((total, item) => total + item.extraReels, 0),
  submittedPics: (task.subtasks || []).filter((subtask) => subtask.type === "PIC" && subtask.status !== "DRAFT").length,
  submittedReels: (task.subtasks || []).filter((subtask) => subtask.type === "REEL" && subtask.status !== "DRAFT").length,
  approvedPics: (task.subtasks || []).filter((subtask) => subtask.type === "PIC" && subtask.status === "APPROVED").length,
  approvedReels: (task.subtasks || []).filter((subtask) => subtask.type === "REEL" && subtask.status === "APPROVED").length,
  subtasks: (task.subtasks || []).map((subtask) => ({
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
});

const getWorkspace = async (workspaceId) => {
  return prisma.shootWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      createdBy: true,
      project: { select: { id: true, projectName: true, clientName: true } },
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: shootTaskInclude,
      },
    },
  });
};

const formatWorkspace = (workspace, viewer) => {
  let pendingSubmissionsCount = 0;

  const visibleTasks = (workspace.tasks || []).filter((task) => {
    const userRole = (viewer?.role || "").toUpperCase();
    return userRole !== "EMPLOYEE" || task.assignments.some((assignment) => assignment.userId === viewer.id);
  });

  const formattedTasks = visibleTasks.map((task) => {
    const taskPendingCount = (task.subtasks || []).filter(
      (sub) => sub.status === "SUBMITTED" || sub.status === "UNABLE_TO_SUBMIT"
    ).length;

    pendingSubmissionsCount += taskPendingCount;

    return {
      ...formatShootTask(task),
      subtaskCount: task.subtasks?.length ?? 0,
      pendingSubmissionsCount: taskPendingCount,
    };
  });

  return {
    id: workspace.id,
    name: workspace.name,
    project: workspace.project || null,
    description: workspace.description,
    createdBy: {
      id: workspace.createdBy.id,
      employeeId: workspace.createdBy.employeeId,
      name: workspace.createdBy.name,
      email: workspace.createdBy.email,
    },
    members: (workspace.members || []).map((member) => ({
      id: member.user.id,
      employeeId: member.user.employeeId,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
    })),
    tasks: formattedTasks,
    pendingSubmissionsCount,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
};

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

  const userRole = (user.role || "").toUpperCase();
  const isMember = workspace.tasks.some((task) =>
    task.assignments.some((assignment) => assignment.userId === user.id)
  );
  const isOwner = workspace.createdById === user.id;
  const canView = ["ADMIN", "HR", "MANAGER", "COORDINATOR"].includes(userRole) || isMember || isOwner;
  if (!canView) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return workspace;
};

const verifyShootTaskAccess = async (user, workspaceId, taskId) => {
  const workspace = await verifyWorkspaceAccess(user, workspaceId);
  const task = workspace.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  const userRole = (user.role || "").toUpperCase();
  if (
    userRole === "EMPLOYEE" &&
    !task.assignments.some((assignment) => assignment.userId === user.id)
  ) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return { workspace, task };
};

exports.createShootWorkspace = async (user, body) => {
  if (body.projectId) {
    const project = await prisma.project.findUnique({ where: { id: body.projectId }, select: { id: true } });
    if (!project) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Project not found.",
      });
    }
  }

  const workspace = await prisma.shootWorkspace.create({
    data: {
      name: body.brandName,
      description: body.description || null,
      createdById: user.id,
      projectId: body.projectId || null,
      members: {
        create: [],
      },
    },
    include: { createdBy: true, project: { select: { id: true, projectName: true, clientName: true } }, members: { include: { user: true } }, tasks: { include: shootTaskInclude } },
  });
  return formatWorkspace(workspace, user);
};

exports.getShootWorkspaces = async (user) => {
  const userRole = (user.role || "").toUpperCase();

  if (["ADMIN", "HR"].includes(userRole)) {
    const workspaces = await prisma.shootWorkspace.findMany({
      include: { createdBy: true, project: { select: { id: true, projectName: true, clientName: true } }, members: { include: { user: true } }, tasks: { include: shootTaskInclude } },
      orderBy: { createdAt: "desc" },
    });
    return workspaces.map((workspace) => formatWorkspace(workspace, user));
  }

  if (userRole === "MANAGER") {
    const workspaces = await prisma.shootWorkspace.findMany({
      where: { createdById: user.id },
      include: { createdBy: true, project: { select: { id: true, projectName: true, clientName: true } }, members: { include: { user: true } }, tasks: { include: shootTaskInclude } },
      orderBy: { createdAt: "desc" },
    });
    return workspaces.map((workspace) => formatWorkspace(workspace, user));
  }

  const workspaces = await prisma.shootWorkspace.findMany({
    where: { tasks: { some: { assignments: { some: { userId: user.id } } } } },
    include: { createdBy: true, project: { select: { id: true, projectName: true, clientName: true } }, members: { include: { user: true } }, tasks: { include: shootTaskInclude } },
    orderBy: { createdAt: "desc" },
  });

  return workspaces.map((workspace) => formatWorkspace(workspace, user));
};

exports.getShootWorkspaceById = async (user, workspaceId) => {
  const workspace = await verifyWorkspaceAccess(user, workspaceId);
  return formatWorkspace(workspace, user);
};

exports.updateShootWorkspace = async (user, workspaceId, body) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  if (body.projectId) {
    const project = await prisma.project.findUnique({ where: { id: body.projectId }, select: { id: true } });
    if (!project) {
      throw new ApiError(400, {
        code: ERRORS.VALIDATION.INVALID_INPUT.code,
        message: "Project not found.",
      });
    }
  }

  const workspace = await prisma.shootWorkspace.update({
    where: { id: workspaceId },
    data: {
      ...(body.brandName !== undefined ? { name: body.brandName } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.projectId !== undefined ? { projectId: body.projectId || null } : {}),
    },
    include: { createdBy: true, project: { select: { id: true, projectName: true, clientName: true } }, members: { include: { user: true } }, tasks: { include: shootTaskInclude } },
  });

  return formatWorkspace(workspace, user);
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
      
      // 🔔 Increment sidebar unread badge for new employee
      incrementUnread(emp.id, "shoots").catch(() => {});
    }
  }

  return formatWorkspace(updatedWorkspace, user);
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
  return formatWorkspace(workspace, user);
};

exports.assignShootTaskEmployees = async (user, workspaceId, taskId, body) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const task = await prisma.shootTask.findFirst({ where: { id: taskId, workspaceId } });
  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  const employeeIds = [...new Set(body.employeeIds)];
  const employees = await prisma.user.findMany({
    where: { employeeId: { in: employeeIds }, role: "EMPLOYEE" },
    select: assignedEmployeeSelect,
  });
  if (employees.length !== employeeIds.length) {
    throw new ApiError(400, {
      code: ERRORS.TASK.EMPLOYEE_NOT_FOUND.code,
      message: ERRORS.TASK.EMPLOYEE_NOT_FOUND.message,
    });
  }

  const existing = await prisma.shootTaskAssignment.findMany({
    where: { taskId, userId: { in: employees.map((employee) => employee.id) } },
  });
  const existingIds = new Set(existing.map((assignment) => assignment.userId));
  const newEmployees = employees.filter((employee) => !existingIds.has(employee.id));

  await prisma.shootTaskAssignment.createMany({
    data: newEmployees.map((employee) => ({ taskId, userId: employee.id })),
    skipDuplicates: true,
  });

  const workspace = await prisma.shootWorkspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });
  const manager = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });
  for (const employee of newEmployees) {
    if (employee.email) {
      sendShootTaskAssignedToEmployeeMail({
        email: employee.email,
        employeeName: employee.name,
        managerName: manager?.name || null,
        workspaceName: workspace?.name || null,
        taskTitle: task.title,
        taskDate: task.date,
        taskLocation: task.location,
        description: task.description,
      }).catch((err) =>
        console.error(`[Mail] Failed to send shoot task email to ${employee.email}:`, err.message)
      );
    }
    incrementUnread(employee.id, "shoots").catch(() => {});
  }

  const updatedTask = await prisma.shootTask.findUnique({
    where: { id: taskId },
    include: shootTaskInclude,
  });
  return formatShootTask(updatedTask);
};

exports.removeShootTaskEmployee = async (user, workspaceId, taskId, employeeId) => {
  await verifyWorkspaceOwnership(user, workspaceId);

  const task = await prisma.shootTask.findFirst({ where: { id: taskId, workspaceId } });
  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  const employee = await prisma.user.findFirst({
    where: { employeeId, role: "EMPLOYEE" },
    select: { id: true },
  });
  if (!employee) {
    throw new ApiError(404, {
      code: ERRORS.TASK.EMPLOYEE_NOT_FOUND.code,
      message: ERRORS.TASK.EMPLOYEE_NOT_FOUND.message,
    });
  }

  await prisma.shootTaskAssignment.deleteMany({ where: { taskId, userId: employee.id } });
  const updatedTask = await prisma.shootTask.findUnique({
    where: { id: taskId },
    include: shootTaskInclude,
  });
  return formatShootTask(updatedTask);
};

exports.submitShootExtraContent = async (user, workspaceId, taskId, body) => {
  const { task } = await verifyShootTaskAccess(user, workspaceId, taskId);

  if ((user.role || "").toUpperCase() !== "EMPLOYEE") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const extraContent = await prisma.shootExtraContent.create({
    data: {
      taskId: task.id,
      submittedById: user.id,
      extraPics: body.extraPics || 0,
      extraReels: body.extraReels || 0,
      driveLink: body.driveLink.trim(),
      notes: body.notes || null,
    },
    include: {
      submittedBy: { select: assignedEmployeeSelect },
    },
  });

  return formatExtraContent(extraContent);
};

exports.getShootExtraContent = async (user, workspaceId, taskId) => {
  await verifyShootTaskAccess(user, workspaceId, taskId);

  const content = await prisma.shootExtraContent.findMany({
    where: { taskId },
    include: {
      submittedBy: { select: assignedEmployeeSelect },
    },
    orderBy: { submittedAt: "desc" },
  });

  return content.map(formatExtraContent);
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
    include: shootTaskInclude,
  });

  return formatShootTask(task);
};

exports.getShootTasks = async (user, workspaceId) => {
  await verifyWorkspaceAccess(user, workspaceId);

  const tasks = await prisma.shootTask.findMany({
    where: {
      workspaceId,
      ...(user.role === "EMPLOYEE"
        ? { assignments: { some: { userId: user.id } } }
        : {}),
    },
    include: shootTaskInclude,
    orderBy: { createdAt: "desc" },
  });

  return tasks.map(formatShootTask);
};

exports.getMyShootTasks = async (user) => {
  const where =
    ["ADMIN", "HR"].includes(user.role)
      ? undefined
      : user.role === "MANAGER"
      ? { workspace: { createdById: user.id } }
      : { assignments: { some: { userId: user.id } } };

  const tasks = await prisma.shootTask.findMany({
    where,
    include: { workspace: true, ...shootTaskInclude },
    orderBy: { createdAt: "desc" },
  });

  return tasks.map((task) => ({ ...formatShootTask(task), workspaceName: task.workspace?.name ?? null }));
};

exports.getShootTaskById = async (user, workspaceId, taskId) => {
  await verifyShootTaskAccess(user, workspaceId, taskId);

  const task = await prisma.shootTask.findFirst({
    where: { id: taskId, workspaceId },
    include: shootTaskInclude,
  });

  if (!task) {
    throw new ApiError(404, {
      code: ERRORS.TASK.NOT_FOUND.code,
      message: ERRORS.TASK.NOT_FOUND.message,
    });
  }

  return formatShootTask(task);
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
    include: shootTaskInclude,
  });

  return formatShootTask(updatedTask);
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
  if (body.dayId && typeof body.dayId === "string" && body.dayId.trim() !== "") {
    const day = await prisma.projectMonthlySheetDay.findUnique({
      where: { id: body.dayId.trim() },
    });
    if (day) {
      validDayId = day.id;
    }
  }

  const subtask = await prisma.shootSubTask.create({
    data: {
      taskId,
      dayId: validDayId,
      title: body.title,
      description: body.description || null,
      type: body.type,
      referenceLinks: Array.isArray(body.referenceLinks) ? body.referenceLinks : [],
      videoType: body.type === "REEL" ? (body.videoType || "HORIZONTAL") : null,
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

  // Notify only employees assigned to this shoot.
  try {
    const workspace = await prisma.shootWorkspace.findUnique({
      where: { id: workspaceId },
      include: {
        tasks: {
          where: { id: taskId },
          include: {
            assignments: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
    });

    const assignedEmployees = workspace?.tasks[0]?.assignments || [];
    if (assignedEmployees.length > 0) {
      const managerUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });

      const taskDateStr = task.date
        ? new Date(task.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : null;

      for (const assignment of assignedEmployees) {
        if (assignment.user.email) {
          sendShootTaskAssignedToEmployeeMail({
            email: assignment.user.email,
            employeeName: assignment.user.name,
            managerName: managerUser?.name || null,
            workspaceName: workspace.name,
            taskTitle: subtask.title,
            taskDate: taskDateStr,
            taskLocation: task.location || null,
            description: subtask.description || null,
          }).catch((err) =>
            console.error(`[Mail] Failed to send shoot subtask email to ${assignment.user.email}:`, err.message)
          );
        }
        
        incrementUnread(assignment.user.id, "shoots").catch(() => {});
      }
    }
  } catch (mailErr) {
    console.error("[Mail] Error fetching workspace members for shoot subtask email:", mailErr.message);
  }

  return result;
};

exports.submitShootSubTask = async (user, workspaceId, taskId, subtaskId, body) => {
  await verifyShootTaskAccess(user, workspaceId, taskId);

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
      message:
        subtask.status === "APPROVED"
          ? "This shoot subtask has already been approved and cannot be resubmitted."
          : "This shoot subtask is already pending review. Wait for the manager's decision.",
    });
  }

  // ✅ REJECTED status is explicitly allowed for resubmission — fall through

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

  // 🔥 Email the workspace creator (manager) about submission (fire-and-forget)
  if (body.submissionLinks && body.submissionLinks.length > 0) {
    const isResubmission = subtask.status === "REJECTED";

    prisma.shootWorkspace.findUnique({
      where: { id: workspaceId },
      include: { createdBy: true },
    }).then(async (workspace) => {
      if (!workspace?.createdBy?.email) return;
      const manager = workspace.createdBy;
      const emp = await prisma.user.findUnique({ where: { id: user.id } });
      // 🔔 Increment sidebar unread badge for workspace creator (manager)
      incrementUnread(manager.id, "shoots").catch(() => {});

      return sendSubmissionMailToManager({
        email: manager.email,
        managerName: manager.name,
        employeeName: emp?.name || "Employee",
        taskTitle: updatedSubtask.title,
        remarks: isResubmission
          ? `[RESUBMISSION] Employee has resubmitted this shoot subtask after rejection. Workspace: ${workspace.name}`
          : `Shoot subtask submission in workspace: ${workspace.name}`,
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
  await verifyShootTaskAccess(user, workspaceId, taskId);

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
  await verifyShootTaskAccess(user, workspaceId, taskId);

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

  let validDayId = undefined;
  if (body.dayId !== undefined) {
    if (body.dayId && typeof body.dayId === "string" && body.dayId.trim() !== "") {
      const day = await prisma.projectMonthlySheetDay.findUnique({
        where: { id: body.dayId.trim() },
      });
      validDayId = day ? day.id : null;
    } else {
      validDayId = null;
    }
  }

  const updatedSubtask = await prisma.shootSubTask.update({
    where: { id: subtaskId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.referenceLinks !== undefined ? { referenceLinks: Array.isArray(body.referenceLinks) ? body.referenceLinks : [] } : {}),
      ...(body.videoType !== undefined ? { videoType: body.videoType || null } : {}),
      ...(body.setupType !== undefined ? { setupType: body.setupType ?? null } : {}),
      ...(validDayId !== undefined ? { dayId: validDayId } : {}),
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
