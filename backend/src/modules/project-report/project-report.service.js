const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const WEB_DEV_DEPARTMENTS = [
  "Web Development",
  "Web Development Department",
  "IT",
];

exports.createReport = async (user, body) => {
  if (user.role !== "EMPLOYEE" && user.role !== "MANAGER") {
    throw new ApiError(403, {
      code: ERRORS.AUTH.ACCESS_DENIED.code,
      message: "Only employees or managers can submit daily reports.",
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { department: true },
  });

  if (!project) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Project not found.",
    });
  }

  if (!WEB_DEV_DEPARTMENTS.includes(project.department?.name)) {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Daily reports are only allowed for Web Development projects.",
    });
  }

  if (project.status === "SUBMITTED" || project.status === "VERIFIED") {
    throw new ApiError(400, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Cannot submit a daily report for a project that is already submitted or verified.",
    });
  }

  const report = await prisma.projectDailyReport.create({
    data: {
      projectId: body.projectId,
      employeeId: user.id,
      content: body.content,
      date: body.date ? new Date(body.date) : new Date(),
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          role: true,
        },
      },
    },
  });

  return report;
};

exports.getProjectReports = async (user, projectId) => {
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
    const isAssigned = project.assignments.some(
      (assignment) => assignment.managerId === user.id
    );
    if (!isAssigned) {
      throw new ApiError(403, {
        code: ERRORS.AUTH.ACCESS_DENIED.code,
        message: "You are not assigned to this project.",
      });
    }
  } else if (!["ADMIN", "HR", "EA"].includes(user.role) && user.role !== "EMPLOYEE") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  // If role is EMPLOYEE, technically they can only view if they are working on it, 
  // but there's no explicit project-employee assignment. We'll let them view or we can restrict.
  // For now, managers and HR can view. 

  const reports = await prisma.projectDailyReport.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          role: true,
        },
      },
    },
  });

  return reports;
};

exports.getAvailableProjects = async (user) => {
  if (user.role !== "EMPLOYEE" && user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const projects = await prisma.project.findMany({
    where: {
      department: {
        name: {
          in: WEB_DEV_DEPARTMENTS
        }
      },
      status: "ONGOING"
    },
    select: {
      id: true,
      projectName: true,
      status: true,
      department: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return projects;
};
