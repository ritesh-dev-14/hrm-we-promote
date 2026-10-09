const cron = require('node-cron');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const mailService = require('../modules/mail/mail.service');
const weeklyVoiceReportReminderTemplate = require('../modules/mail/templates/weeklyVoiceReportReminder.template');
const notificationService = require('../services/notificationService');

let jobInstance = null;

exports.initializeWeeklyVoiceReportJob = () => {
  try {
    // Run at 09:00 AM every Saturday
    jobInstance = cron.schedule('0 9 * * 6', async () => {

      try {
        await runWeeklyVoiceReportJob();
      } catch (error) {
        console.error('❌ Weekly Voice Report job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata', // IST timezone
    });


    return jobInstance;
  } catch (error) {
    console.error('Failed to initialize Weekly Voice Report job:', error);
    throw error;
  }
};

const runWeeklyVoiceReportJob = async () => {
  // 1. Fetch relevant users: EA, ADMIN, and Managers in SEO/Marketing
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'EA' },
        { role: 'ADMIN' },
        {
          role: 'MANAGER',
          OR: [
            { department: { name: { contains: 'SEO' } } },
            { department: { name: { contains: 'Marketing' } } }
          ]
        }
      ]
    }
  });

  if (users.length === 0) return;

  const appUrl = process.env.APP_URL || "http://localhost:5173";

  // 2. Loop through users and send email/notification
  for (const user of users) {
    // Send Email
    const emailTemplate = weeklyVoiceReportReminderTemplate({
      name: user.name,
      applicationUrl: appUrl,
    });

    try {
      await mailService.sendMail({
        to: user.email,
        subject: `🎙️ Reminder: Weekly Voice Reports Due Today`,
        html: emailTemplate,
      });
    } catch (err) {
      console.error(`Failed to send email to ${user.email}`, err);
    }

    // Send In-App Notification (assuming notificationService exists with this signature or we can manually create it)
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Weekly Voice Reports Due",
          message: "Please remember to submit your weekly voice reports for your active clients.",
          type: "VOICE_REPORT_REMINDER",
          level: "INFO",
        },
      });
      // Optionally notify via socket if needed
      if (global.io) {
        global.io.to(user.id).emit('new-notification', { title: "Weekly Voice Reports Due" });
      }
    } catch (err) {
      console.error(`Failed to send in-app notification to ${user.id}`, err);
    }
  }


};
