const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const escalationService = require("../services/escalationService");
const notificationService = require("../services/notificationService");

const prisma = new PrismaClient();

//
// 🔥 DAILY CHECK JOB - Runs at 12:59 AM
// Detects managers who haven't assigned tasks for tomorrow and next 4 days
//
const setupDailyCheckJob = () => {
  // Run at 12:59 AM every day
  cron.schedule("59 0 * * *", async () => {
    try {

      await escalationService.checkMissingTaskAssignments();

    } catch (error) {
      console.error("❌ Daily check job failed:", error);
    }
  });


};

//
// 🔥 FIRST REMINDER JOB - Runs at 1:00 PM
// Sends first reminder to managers
//
const setupFirstReminderJob = (io) => {
  // Run at 13:00 (1:00 PM) every day
  cron.schedule("0 13 * * *", async () => {
    try {


      const escalations = await escalationService.getPendingEscalations();

      for (const escalation of escalations) {
        // Check if reminder1 not already sent
        if (!escalation.reminder1SentAt) {
          await notificationService.sendManagerReminder(
            escalation.manager,
            escalation.employee,
            escalation.escalationDate,
            1,
            io
          );

          // Update escalation with reminder1SentAt
          await escalationService.updateEscalationStatus(
            escalation.id,
            "MANAGER_NOTIFIED",
            { reminder1SentAt: new Date() }
          );
        }
      }


    } catch (error) {
      console.error("❌ First reminder job failed:", error);
    }
  });


};

//
// 🔥 SECOND REMINDER JOB - Runs at 2:00 PM
// Sends second reminder to managers
//
const setupSecondReminderJob = (io) => {
  // Run at 14:00 (2:00 PM) every day
  cron.schedule("0 14 * * *", async () => {
    try {


      const escalations = await escalationService.getPendingEscalations();

      for (const escalation of escalations) {
        // Check if task still not assigned and reminder2 not already sent
        if (
          !escalation.resolvedAt &&
          !escalation.reminder2SentAt
        ) {
          await notificationService.sendManagerReminder(
            escalation.manager,
            escalation.employee,
            escalation.escalationDate,
            2,
            io
          );

          // Update escalation with reminder2SentAt
          await escalationService.updateEscalationStatus(
            escalation.id,
            "MANAGER_NOTIFIED",
            { reminder2SentAt: new Date() }
          );
        }
      }


    } catch (error) {
      console.error("❌ Second reminder job failed:", error);
    }
  });


};

//
// 🔥 THIRD REMINDER JOB - Runs at 2:30 PM
// Sends third reminder to managers
//
const setupThirdReminderJob = (io) => {
  // Run at 14:30 (2:30 PM) every day
  cron.schedule("30 14 * * *", async () => {
    try {


      const escalations = await escalationService.getPendingEscalations();

      for (const escalation of escalations) {
        // Check if task still not assigned and reminder3 not already sent
        if (
          !escalation.resolvedAt &&
          !escalation.reminder3SentAt
        ) {
          await notificationService.sendManagerReminder(
            escalation.manager,
            escalation.employee,
            escalation.escalationDate,
            3,
            io
          );

          // Update escalation with reminder3SentAt
          await escalationService.updateEscalationStatus(
            escalation.id,
            "MANAGER_NOTIFIED",
            { reminder3SentAt: new Date() }
          );
        }
      }


    } catch (error) {
      console.error("❌ Third reminder job failed:", error);
    }
  });


};

//
// 🔥 HR ESCALATION JOB - Runs at 3:00 PM
// Escalates to HR if manager still hasn't assigned tasks
//
const setupHRescalationJob = (io) => {
  // Run at 15:00 (3:00 PM) every day
  cron.schedule("0 15 * * *", async () => {
    try {


      const escalations = await escalationService.getPendingEscalations();

      for (const escalation of escalations) {
        // Check if task still not assigned and HR not already escalated
        if (
          !escalation.resolvedAt &&
          !escalation.hrEscalatedAt
        ) {
          await notificationService.sendHREscalation(
            escalation.manager,
            escalation.employee,
            escalation.escalationDate,
            io
          );

          // Update escalation with hrEscalatedAt
          await escalationService.updateEscalationStatus(
            escalation.id,
            "HR_ESCALATED",
            {
              hrEscalatedAt: new Date(),
              hrMailSent: true,
              popupSent: true,
            }
          );
        }
      }


    } catch (error) {
      console.error("❌ HR escalation job failed:", error);
    }
  });


};

//
// 🔥 ADMIN ESCALATION JOB - Runs at 4:00 PM
// Escalates to Admin if manager still hasn't assigned tasks
//
const setupAdminEscalationJob = (io) => {
  // Run at 16:00 (4:00 PM) every day
  cron.schedule("0 16 * * *", async () => {
    try {
      

      const escalations = await escalationService.getPendingEscalations();

      for (const escalation of escalations) {
        // Check if task still not assigned and Admin not already escalated
        if (
          !escalation.resolvedAt &&
          !escalation.adminEscalatedAt
        ) {
          await notificationService.sendAdminEscalation(
            escalation.manager,
            escalation.employee,
            escalation.escalationDate,
            io
          );

          // Update escalation with adminEscalatedAt
          await escalationService.updateEscalationStatus(
            escalation.id,
            "ADMIN_ESCALATED",
            {
              adminEscalatedAt: new Date(),
              adminMailSent: true,
            }
          );
        }
      }


    } catch (error) {
      console.error("❌ Admin escalation job failed:", error);
    }
  });


};

//
// 🔥 FINAL ESCALATION JOB - Runs at 6:00 PM
// Final escalation to both HR and Admin if still not resolved
//
const setupFinalEscalationJob = (io) => {
  // Run at 18:00 (6:00 PM) every day
  cron.schedule("0 18 * * *", async () => {
    try {
      

      const escalations = await escalationService.getPendingEscalations();

      for (const escalation of escalations) {
        // Check if task still not assigned
        if (
          !escalation.resolvedAt &&
          !escalation.finalEscalatedAt
        ) {
          await notificationService.sendFinalEscalation(
            escalation.manager,
            escalation.employee,
            escalation.escalationDate,
            io
          );

          // Update escalation with finalEscalatedAt
          await escalationService.updateEscalationStatus(
            escalation.id,
            "FINAL_ESCALATED",
            {
              finalEscalatedAt: new Date(),
            }
          );
        }
      }


    } catch (error) {
      console.error("❌ Final escalation job failed:", error);
    }
  });


};

//
// 🔥 INITIALIZE ALL JOBS
//
const setupEscalationJobs = (io) => {
  

  setupDailyCheckJob();
  setupFirstReminderJob(io);
  setupSecondReminderJob(io);
  setupThirdReminderJob(io);
  setupHRescalationJob(io);
  setupAdminEscalationJob(io);
  setupFinalEscalationJob(io);

  
};

module.exports = { setupEscalationJobs };
