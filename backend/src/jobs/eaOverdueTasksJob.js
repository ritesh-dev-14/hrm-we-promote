const cron = require("node-cron");
const prisma = require("../config/prisma");
const mailService = require("../modules/mail/mail.service");
const emailTemplate = require("../modules/mail/templates/eaOverdueTasks.template");
const {
  DIGEST_ENTITY_PREFIX,
  getDateKeyInIST,
  listOverdueEaTasks,
} = require("../modules/ea-overdue-tasks/ea-overdue-tasks.service");

const RECIPIENT_ROLES = ["ADMIN", "HR", "EA"];
const EVENT_NAME = "ea-overdue-tasks-popup";

const runEaOverdueTasksJob = async ({ now = new Date(), io = global.io } = {}) => {
  const tasks = await listOverdueEaTasks(now);
  if (tasks.length === 0) {
    return { taskCount: 0, notificationsCreated: 0, emailsSent: 0, recipientFailures: 0 };
  }

  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { role: { in: RECIPIENT_ROLES } },
        { roles: { hasSome: RECIPIENT_ROLES } },
      ],
    },
    select: { id: true, name: true, email: true },
  });

  const uniqueRecipients = [...new Map(recipients.map((recipient) => [recipient.id, recipient])).values()];
  const dateKey = getDateKeyInIST(now);
  const entityId = `${DIGEST_ENTITY_PREFIX}${dateKey}`;
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(now);

  let notificationsCreated = 0;
  let emailsSent = 0;
  let recipientFailures = 0;

  for (const recipient of uniqueRecipients) {
    try {
      const existingNotification = await prisma.notification.findFirst({
        where: { userId: recipient.id, type: "TASK_OVERDUE", entityId },
        select: { id: true },
      });
      if (existingNotification) continue;

      const notification = await prisma.notification.create({
        data: {
          userId: recipient.id,
          title: "Overdue EA-Assigned Tasks",
          message: `${tasks.length} task${tasks.length === 1 ? "" : "s"} due today or earlier remain incomplete.`,
          type: "TASK_OVERDUE",
          level: "WARNING",
          entityId,
        },
      });
      notificationsCreated++;

      if (io) {
        io.to(`user-${recipient.id}`).emit(EVENT_NAME, {
          notificationId: notification.id,
          taskCount: tasks.length,
        });
      }

      if (!recipient.email) {
        console.warn(`[EA Overdue Tasks] No email address for recipient ${recipient.id}.`);
        continue;
      }

      try {
        await mailService.sendMail({
          to: recipient.email,
          subject: `Overdue EA-Assigned Tasks: ${tasks.length} task${tasks.length === 1 ? "" : "s"}`,
          html: emailTemplate({
            recipientName: recipient.name,
            tasks,
            date: formattedDate,
            applicationUrl: process.env.APP_URL || "http://localhost:5173",
          }),
        });
        emailsSent++;
      } catch (error) {
        recipientFailures++;
        console.error(`[EA Overdue Tasks] Email failed for ${recipient.id}:`, error);
      }

      try {
        await prisma.notification.updateMany({
          where: {
            userId: recipient.id,
            type: "TASK_OVERDUE",
            entityId: { startsWith: DIGEST_ENTITY_PREFIX },
            isRead: false,
            id: { not: notification.id },
          },
          data: { isRead: true, readAt: now },
        });
      } catch (error) {
        recipientFailures++;
        console.error(`[EA Overdue Tasks] Previous digest cleanup failed for ${recipient.id}:`, error);
      }
    } catch (error) {
      recipientFailures++;
      console.error(`[EA Overdue Tasks] Digest failed for ${recipient.id}:`, error);
    }
  }

  const result = { taskCount: tasks.length, notificationsCreated, emailsSent, recipientFailures };
  console.log("[EA Overdue Tasks] Daily digest completed:", result);
  return result;
};

const initializeEaOverdueTasksJob = () => {
  const job = cron.schedule(
    "15 18 * * *",
    async () => {
      try {
        await runEaOverdueTasksJob();
      } catch (error) {
        console.error("[EA Overdue Tasks] Job failed:", error);
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" },
  );

  console.log("[EA Overdue Tasks] Scheduled daily at 6:15 PM IST.");
  return job;
};

exports.initializeEaOverdueTasksJob = initializeEaOverdueTasksJob;
exports.runEaOverdueTasksJob = runEaOverdueTasksJob;
