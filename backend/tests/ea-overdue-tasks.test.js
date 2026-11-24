const test = require("node:test");
const assert = require("node:assert/strict");

const prisma = require("../src/config/prisma");
const mailService = require("../src/modules/mail/mail.service");
const {
  buildOverdueWhere,
  getStartOfNextDayInIST,
} = require("../src/modules/ea-overdue-tasks/ea-overdue-tasks.service");
const { runEaOverdueTasksJob } = require("../src/jobs/eaOverdueTasksJob");

test("overdue selection includes EA tasks due by end of today in India", () => {
  const now = new Date("2026-11-24T12:45:00.000Z");
  const where = buildOverdueWhere(now);

  assert.equal(getStartOfNextDayInIST(now).toISOString(), "2026-11-24T18:30:00.000Z");
  assert.equal(where.completionDate.lt.toISOString(), "2026-11-24T18:30:00.000Z");
  assert.deepEqual(where.status.in, ["ASSIGNED", "IN_PROGRESS", "REJECTED", "PENDING", "UNABLE_TO_SUBMIT"]);
  assert.equal(where.createdBy.is.role, "EA");
  assert.deepEqual(where.assignedTo.is.role.in, ["EMPLOYEE", "MANAGER", "HR"]);
});

test("daily overdue job emails each Admin, HR, and EA recipient and persists popup notifications", async () => {
  const originalAssignmentFindMany = prisma.coordinatorAssignment.findMany;
  const originalUserFindMany = prisma.user.findMany;
  const originalNotificationFindFirst = prisma.notification.findFirst;
  const originalNotificationCreate = prisma.notification.create;
  const originalNotificationUpdateMany = prisma.notification.updateMany;
  const originalSendMail = mailService.sendMail;
  const emails = [];
  const notifications = [];
  const events = [];
  const assignments = [{
    id: "assignment-1",
    assignedBy: "EA",
    completionDate: new Date("2026-11-23T18:30:00.000Z"),
    status: "IN_PROGRESS",
    task: { id: "task-1", projectName: "Prepare report", description: null },
    assignedTo: { id: "employee-1", name: "Employee", role: "EMPLOYEE" },
    createdBy: { id: "ea-1", name: "EA User" },
  }];
  const recipients = [
    { id: "admin-1", name: "Admin", email: "admin@example.com" },
    { id: "hr-1", name: "HR", email: "hr@example.com" },
    { id: "ea-1", name: "EA", email: "ea@example.com" },
    { id: "admin-1", name: "Admin duplicate", email: "admin@example.com" },
  ];

  prisma.coordinatorAssignment.findMany = async () => assignments;
  prisma.user.findMany = async () => recipients;
  prisma.notification.findFirst = async ({ where }) => {
    const existing = notifications.find(
      (notification) => notification.userId === where.userId && notification.entityId === where.entityId,
    );
    return existing ? { id: `notification-${existing.userId}` } : null;
  };
  prisma.notification.create = async ({ data }) => {
    notifications.push(data);
    return { id: `notification-${data.userId}`, ...data };
  };
  prisma.notification.updateMany = async () => ({ count: 0 });
  mailService.sendMail = async (email) => { emails.push(email); };
  const io = {
    to: (room) => ({
      emit: (eventName, data) => events.push({ room, eventName, data }),
    }),
  };

  try {
    const result = await runEaOverdueTasksJob({
      now: new Date("2026-11-24T12:45:00.000Z"),
      io,
    });

    assert.deepEqual(result, {
      taskCount: 1,
      notificationsCreated: 3,
      emailsSent: 3,
      recipientFailures: 0,
    });
    assert.equal(emails.length, 3);
    assert.equal(notifications.length, 3);
    assert.equal(events.length, 3);
    assert.ok(notifications.every((notification) => notification.entityId === "ea-overdue-digest:2026-11-24"));
    assert.ok(events.every((event) => event.eventName === "ea-overdue-tasks-popup"));

    const rerun = await runEaOverdueTasksJob({
      now: new Date("2026-11-24T12:45:00.000Z"),
      io,
    });
    assert.deepEqual(rerun, {
      taskCount: 1,
      notificationsCreated: 0,
      emailsSent: 0,
      recipientFailures: 0,
    });
    assert.equal(emails.length, 3);
  } finally {
    prisma.coordinatorAssignment.findMany = originalAssignmentFindMany;
    prisma.user.findMany = originalUserFindMany;
    prisma.notification.findFirst = originalNotificationFindFirst;
    prisma.notification.create = originalNotificationCreate;
    prisma.notification.updateMany = originalNotificationUpdateMany;
    mailService.sendMail = originalSendMail;
  }
});
