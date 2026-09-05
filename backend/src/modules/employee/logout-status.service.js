const prisma = require("../../config/prisma");

const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

exports.getLogoutStatus = async (user) => {
  const { start, end } = getDayBounds();

  const assignments = await prisma.taskItemAssignment.findMany({
    where: {
      userId: user.id,
      taskItem: {
        dueDate: {
          gte: start,
          lt: end,
        },
      },
    },
    include: {
      taskItem: {
        select: {
          id: true,
          title: true,
          dueDate: true,
          task: {
            select: {
              id: true,
              projectName: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { taskItem: { dueDate: "asc" } },
  });

  const eaAssignments = await prisma.coordinatorAssignment.findMany({
    where: {
      assignedToId: user.id,
      completionDate: {
        gte: start,
        lt: end,
      },
      createdBy: {
        role: "EA",
      },
    },
    include: {
      task: {
        select: {
          id: true,
          projectName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: { completionDate: "asc" },
  });

  const pendingManagerTasks = assignments
    .filter((assignment) => assignment.status !== "VERIFIED")
    .map((assignment) => ({
      assignmentId: assignment.id,
      taskItemId: assignment.taskItem.id,
      title: assignment.taskItem.title,
      projectName: assignment.taskItem.task.projectName,
      dueDate: assignment.taskItem.dueDate,
      status: assignment.status,
      source: "MANAGER",
      assignedBy: assignment.taskItem.task.createdBy,
    }));

  const pendingEaTasks = eaAssignments
    .filter((assignment) => !["SUBMITTED", "COMPLETED"].includes(assignment.status))
    .map((assignment) => ({
      assignmentId: assignment.id,
      taskId: assignment.task.id,
      title: assignment.task.projectName,
      projectName: assignment.task.projectName,
      dueDate: assignment.completionDate,
      status: assignment.status,
      source: "EA",
      assignedBy: assignment.createdBy,
    }));

  const pendingTasks = [...pendingManagerTasks, ...pendingEaTasks].sort(
    (first, second) => new Date(first.dueDate) - new Date(second.dueDate)
  );

  const totalTasks = assignments.length + eaAssignments.length;

  return {
    canLogout: pendingTasks.length === 0,
    date: start.toISOString().slice(0, 10),
    totalTasks,
    completedTasks: totalTasks - pendingTasks.length,
    pendingTasks,
  };
};