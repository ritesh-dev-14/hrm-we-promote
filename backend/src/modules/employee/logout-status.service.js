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
            },
          },
        },
      },
    },
    orderBy: { taskItem: { dueDate: "asc" } },
  });

  const pendingTasks = assignments
    .filter((assignment) => assignment.status !== "VERIFIED")
    .map((assignment) => ({
      assignmentId: assignment.id,
      taskItemId: assignment.taskItem.id,
      title: assignment.taskItem.title,
      projectName: assignment.taskItem.task.projectName,
      dueDate: assignment.taskItem.dueDate,
      status: assignment.status,
    }));

  return {
    canLogout: pendingTasks.length === 0,
    date: start.toISOString().slice(0, 10),
    totalTasks: assignments.length,
    completedTasks: assignments.length - pendingTasks.length,
    pendingTasks,
  };
};