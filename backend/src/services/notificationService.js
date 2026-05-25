const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const mailService = require("../modules/mail/mail.service");
const managerTaskReminderTemplate = require("../modules/mail/templates/managerTaskReminder.template");
const escalationAlertTemplate = require("../modules/mail/templates/escalationAlert.template");

//
// 🔥 CREATE IN-APP NOTIFICATION
//
const createNotification = async (userId, data) => {
  const { title, message, type, level = "INFO", entityId } = data;

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      level,
      entityId,
    },
  });

  return notification;
};

//
// 🔥 SEND MANAGER REMINDER
//
const sendManagerReminder = async (
  manager,
  employee,
  date,
  reminderCount,
  io
) => {
  try {
    // 1. Send Email
    const emailTemplate = managerTaskReminderTemplate({
      managerName: manager.name,
      employeeName: employee.name,
      reminderCount,
      date: new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      applicationUrl: process.env.APP_URL || "http://localhost:5173",
    });

    await mailService.sendMail({
      to: manager.email,
      subject: `⏰ Task Assignment Reminder #${reminderCount} - ${employee.name}`,
      html: emailTemplate,
    });

    console.log(`📧 Email sent to ${manager.email} (Reminder #${reminderCount})`);

    // 2. Create In-App Notification
    const notification = await createNotification(manager.id, {
      title: `Task Assignment Reminder #${reminderCount}`,
      message: `You have not assigned tasks to ${employee.name} for ${new Date(date).toLocaleDateString()}`,
      type: "MANAGER_REMINDER",
      level: reminderCount === 3 ? "WARNING" : "INFO",
      entityId: manager.id,
    });

    console.log(`🔔 In-app notification created for ${manager.name}`);

    // 3. Emit WebSocket Event (Pop-up)
    if (io) {
      io.emit("task-reminder", {
        managerId: manager.id,
        employeeName: employee.name,
        date: new Date(date).toLocaleDateString(),
        reminderCount,
        level: reminderCount === 3 ? "warning" : "info",
      });

      console.log(`📢 WebSocket pop-up sent to ${manager.name}`);
    }

    return { success: true, notification };
  } catch (error) {
    console.error("❌ Error sending manager reminder:", error);
    throw error;
  }
};

//
// 🔥 SEND HR ESCALATION ALERT
//
const sendHREscalation = async (manager, employee, date, io) => {
  try {
    // Get all HR users
    const hrUsers = await prisma.user.findMany({
      where: { role: "HR" },
      select: { id: true, name: true, email: true },
    });

    for (const hrUser of hrUsers) {
      // 1. Send Email
      const emailTemplate = escalationAlertTemplate({
        hrName: hrUser.name,
        managerName: manager.name,
        employeeName: employee.name,
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        escalationLevel: "HR",
        applicationUrl: process.env.APP_URL || "http://localhost:5173",
      });

      await mailService.sendMail({
        to: hrUser.email,
        subject: `🚨 HR ALERT: Task Assignment Not Completed - ${manager.name}`,
        html: emailTemplate,
      });

      console.log(`📧 HR email sent to ${hrUser.email}`);

      // 2. Create In-App Notification
      await createNotification(hrUser.id, {
        title: "🚨 Task Assignment Escalation - HR Alert",
        message: `Manager ${manager.name} has not assigned tasks to ${employee.name}. Immediate action required.`,
        type: "HR_ESCALATION",
        level: "ESCALATION",
        entityId: manager.id,
      });

      console.log(`🔔 HR notification created for ${hrUser.name}`);

      // 3. Emit WebSocket Event
      if (io) {
        io.emit("hr-escalation", {
          hrId: hrUser.id,
          managerId: manager.id,
          managerName: manager.name,
          employeeName: employee.name,
          date: new Date(date).toLocaleDateString(),
          level: "danger",
        });

        console.log(`📢 HR WebSocket pop-up sent`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error sending HR escalation:", error);
    throw error;
  }
};

//
// 🔥 SEND ADMIN ESCALATION ALERT
//
const sendAdminEscalation = async (manager, employee, date, io) => {
  try {
    // Get all ADMIN users
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
    });

    for (const adminUser of adminUsers) {
      // 1. Send Email
      const emailTemplate = escalationAlertTemplate({
        hrName: adminUser.name,
        managerName: manager.name,
        employeeName: employee.name,
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        escalationLevel: "ADMIN",
        applicationUrl: process.env.APP_URL || "http://localhost:5173",
      });

      await mailService.sendMail({
        to: adminUser.email,
        subject: `🚨 ADMIN ALERT: Critical Task Assignment Issue - ${manager.name}`,
        html: emailTemplate,
      });

      console.log(`📧 Admin email sent to ${adminUser.email}`);

      // 2. Create In-App Notification
      await createNotification(adminUser.id, {
        title: "🚨 CRITICAL: Task Assignment Escalation - Admin Alert",
        message: `CRITICAL: Manager ${manager.name} has not assigned tasks to ${employee.name}. HR escalation also in effect.`,
        type: "ADMIN_ESCALATION",
        level: "CRITICAL",
        entityId: manager.id,
      });

      console.log(`🔔 Admin notification created for ${adminUser.name}`);

      // 3. Emit WebSocket Event
      if (io) {
        io.emit("admin-escalation", {
          adminId: adminUser.id,
          managerId: manager.id,
          managerName: manager.name,
          employeeName: employee.name,
          date: new Date(date).toLocaleDateString(),
          level: "critical",
        });

        console.log(`📢 Admin WebSocket pop-up sent`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error sending admin escalation:", error);
    throw error;
  }
};

//
// 🔥 SEND FINAL ESCALATION (HR + ADMIN)
//
const sendFinalEscalation = async (manager, employee, date, io) => {
  try {
    // Get all HR and Admin users
    const allRecipients = await prisma.user.findMany({
      where: { role: { in: ["HR", "ADMIN"] } },
      select: { id: true, name: true, email: true, role: true },
    });

    for (const recipient of allRecipients) {
      // 1. Send Email
      const emailTemplate = escalationAlertTemplate({
        hrName: recipient.name,
        managerName: manager.name,
        employeeName: employee.name,
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        escalationLevel: "FINAL",
        applicationUrl: process.env.APP_URL || "http://localhost:5173",
      });

      await mailService.sendMail({
        to: recipient.email,
        subject: `🚨🚨 FINAL ESCALATION: Task Assignment Critical - ${manager.name}`,
        html: emailTemplate,
      });

      console.log(`📧 Final escalation email sent to ${recipient.email}`);

      // 2. Create In-App Notification
      await createNotification(recipient.id, {
        title: "🚨🚨 FINAL ESCALATION: Task Assignment Crisis",
        message: `FINAL ESCALATION: Manager ${manager.name} has still not assigned tasks to ${employee.name}. Immediate disciplinary action may be required.`,
        type: "ADMIN_ESCALATION",
        level: "CRITICAL",
        entityId: manager.id,
      });

      console.log(
        `🔔 Final escalation notification created for ${recipient.name}`
      );

      // 3. Emit WebSocket Event
      if (io) {
        io.emit("final-escalation", {
          recipientId: recipient.id,
          recipientRole: recipient.role,
          managerId: manager.id,
          managerName: manager.name,
          employeeName: employee.name,
          date: new Date(date).toLocaleDateString(),
          level: "critical",
        });

        console.log(`📢 Final escalation WebSocket pop-up sent`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error sending final escalation:", error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendManagerReminder,
  sendHREscalation,
  sendAdminEscalation,
  sendFinalEscalation,
};
