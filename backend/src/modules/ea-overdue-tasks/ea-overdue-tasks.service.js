const prisma = require("../../config/prisma");

const DIGEST_ENTITY_PREFIX = "ea-overdue-digest:";
const IST_OFFSET_MINUTES = 330;
const INCOMPLETE_STATUSES = ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "REJECTED", "PENDING", "UNABLE_TO_SUBMIT"];
const CREATOR_ROLES = ["COORDINATOR"];
const ASSIGNEE_ROLES = ["EMPLOYEE", "MANAGER", "HR"];

const getDateKeyInIST = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const getStartOfNextDayInIST = (date) => {
  const [year, month, day] = getDateKeyInIST(date).split("-").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day + 1) - IST_OFFSET_MINUTES * 60 * 1000,
  );
};

const buildOverdueWhere = (date) => ({
  completionDate: { lt: getStartOfNextDayInIST(date) },
  status: { in: INCOMPLETE_STATUSES },
  createdBy: { is: { role: { in: CREATOR_ROLES } } },
  assignedTo: { is: { role: { in: ASSIGNEE_ROLES } } },
});

const buildOutstandingWhere = () => ({
  status: { in: INCOMPLETE_STATUSES },
  createdBy: { is: { role: { in: CREATOR_ROLES } } },
  assignedTo: { is: { role: { in: ASSIGNEE_ROLES } } },
});

const listAssignments = (where) =>
  prisma.coordinatorAssignment.findMany({
    where,
    select: {
      id: true,
      assignedBy: true,
      assignedTime: true,
      completionDate: true,
      status: true,
      task: {
        select: {
          id: true,
          projectName: true,
          description: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          email: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { completionDate: "asc" },
  });

const listOverdueEaTasks = (date = new Date()) =>
  listAssignments(buildOverdueWhere(date));

const listOutstandingTasks = () =>
  listAssignments(buildOutstandingWhere());

const getUnreadDigestNotification = async (userId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      userId,
      type: "TASK_OVERDUE",
      isRead: false,
      entityId: { startsWith: DIGEST_ENTITY_PREFIX },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!notification) return null;

  const tasks = await listOverdueEaTasks();
  if (tasks.length === 0) {
    await prisma.notification.updateMany({
      where: {
        userId,
        type: "TASK_OVERDUE",
        isRead: false,
        entityId: { startsWith: DIGEST_ENTITY_PREFIX },
      },
      data: { isRead: true, readAt: new Date() },
    });
    return null;
  }

  return { notification, tasks };
};

const markDigestNotificationRead = (userId, notificationId) =>
  prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      type: "TASK_OVERDUE",
      entityId: { startsWith: DIGEST_ENTITY_PREFIX },
    },
    data: { isRead: true, readAt: new Date() },
  });

exports.DIGEST_ENTITY_PREFIX = DIGEST_ENTITY_PREFIX;
exports.buildOutstandingWhere = buildOutstandingWhere;
exports.buildOverdueWhere = buildOverdueWhere;
exports.getDateKeyInIST = getDateKeyInIST;
exports.getStartOfNextDayInIST = getStartOfNextDayInIST;
exports.getUnreadDigestNotification = getUnreadDigestNotification;
exports.listOverdueEaTasks = listOverdueEaTasks;
exports.listOutstandingTasks = listOutstandingTasks;
exports.markDigestNotificationRead = markDigestNotificationRead;
