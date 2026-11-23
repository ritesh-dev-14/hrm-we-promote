const cron = require("node-cron");
const prisma = require("../config/prisma");
const mailService = require("../modules/mail/mail.service");
const template = require("../modules/mail/templates/eaAdminPendingTasks.template");

let jobInstance = null;

const runEaAdminPendingTasksJob = async () => {
  const [admins, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
    }),
    prisma.coordinatorAssignment.findMany({
      where: {
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
        assignedTo: { role: "ADMIN" },
        createdBy: { role: "EA" },
      },
      include: {
        task: true,
        assignedTo: true,
        createdBy: true,
      },
      orderBy: { completionDate: "asc" },
    }),
  ]);

  let emailsSent = 0;

  for (const admin of admins) {
    if (!admin.email) continue;

    const adminTasks = assignments.filter(
      (assignment) => assignment.assignedToId === admin.id
    );

    await mailService.sendMail({
      to: admin.email,
      subject: `Pending EA Tasks Summary: ${adminTasks.length} Task${adminTasks.length === 1 ? "" : "s"}`,
      html: template({
        adminName: admin.name,
        tasks: adminTasks,
      }),
    });

    emailsSent += 1;
  }

  console.log(
    `[EA Admin Pending Tasks] Sent ${emailsSent} email(s) for ${assignments.length} pending task(s).`
  );

  return {
    emailsSent,
    pendingTasks: assignments.length,
  };
};

const initializeEaAdminPendingTasksJob = () => {
  jobInstance = cron.schedule(
    "0 18 * * *",
    async () => {
      try {
        await runEaAdminPendingTasksJob();
      } catch (error) {
        console.error("[EA Admin Pending Tasks] Job failed:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  console.log("[EA Admin Pending Tasks] Scheduled daily at 6:00 PM IST.");
  return jobInstance;
};

exports.initializeEaAdminPendingTasksJob = initializeEaAdminPendingTasksJob;
exports.runEaAdminPendingTasksJob = runEaAdminPendingTasksJob;
