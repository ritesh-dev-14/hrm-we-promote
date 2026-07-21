const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//
// 🔥 SETUP SOCKET.IO FOR REAL-TIME NOTIFICATIONS
//
const setupSocketIO = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "https://hrm.wepromoteindia.com"
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //
  // 🔥 SOCKET CONNECTION
  //
  io.on("connection", (socket) => {
    console.log(`📱 User connected: ${socket.id}`);

    //
    // 🔥 JOIN USER ROOM - So we can send specific notifications
    //
    socket.on("join-user", (data) => {
      const { userId } = data;
      socket.join(`user-${userId}`);
      console.log(`✅ User ${userId} joined their notification room`);
    });

    //
    // 🔥 LEAVE USER ROOM
    //
    socket.on("leave-user", (data) => {
      const { userId } = data;
      socket.leave(`user-${userId}`);
      console.log(`❌ User ${userId} left their notification room`);
    });

    //
    // 🔥 TASK REMINDER NOTIFICATION
    //
    socket.on("task-reminder", (data) => {
      const { managerId } = data;
      io.to(`user-${managerId}`).emit("task-reminder-popup", {
        type: "TASK_REMINDER",
        title: data.title || "Task Assignment Reminder",
        message: data.message || "You have not assigned tasks",
        level: data.level || "info",
        timestamp: new Date(),
      });
      console.log(`📢 Task reminder sent to manager ${managerId}`);
    });

    //
    // 🔥 HR ESCALATION NOTIFICATION
    //
    socket.on("hr-escalation", (data) => {
      const { hrId } = data;
      io.to(`user-${hrId}`).emit("hr-escalation-popup", {
        type: "HR_ESCALATION",
        title: "Task Assignment Escalation - HR Alert",
        message: `Manager ${data.managerName} has not assigned tasks to ${data.employeeName}`,
        level: "danger",
        managerId: data.managerId,
        timestamp: new Date(),
      });
      console.log(`📢 HR escalation sent to HR user ${hrId}`);
    });

    //
    // 🔥 ADMIN ESCALATION NOTIFICATION
    //
    socket.on("admin-escalation", (data) => {
      const { adminId } = data;
      io.to(`user-${adminId}`).emit("admin-escalation-popup", {
        type: "ADMIN_ESCALATION",
        title: "Critical Task Assignment Issue - Admin Alert",
        message: `Manager ${data.managerName} has not assigned tasks to ${data.employeeName}. HR also notified.`,
        level: "critical",
        managerId: data.managerId,
        timestamp: new Date(),
      });
      console.log(`📢 Admin escalation sent to Admin user ${adminId}`);
    });

    //
    // 🔥 FINAL ESCALATION NOTIFICATION
    //
    socket.on("final-escalation", (data) => {
      const { recipientId } = data;
      io.to(`user-${recipientId}`).emit("final-escalation-popup", {
        type: "FINAL_ESCALATION",
        title: "CRITICAL: Final Task Assignment Escalation",
        message: `Manager ${data.managerName} has not assigned tasks to ${data.employeeName}. Both HR and Admin have been notified.`,
        level: "critical",
        managerId: data.managerId,
        recipientRole: data.recipientRole,
        timestamp: new Date(),
      });
      console.log(
        `📢 Final escalation sent to ${data.recipientRole} user ${recipientId}`
      );
    });

    //
    // 🔥 DISCONNECT
    //
    socket.on("disconnect", () => {
      console.log(`📴 User disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

//
// 🔥 BROADCAST NOTIFICATION TO SPECIFIC USER
//
const notifyUser = (io, userId, notificationType, data) => {
  io.to(`user-${userId}`).emit(notificationType, {
    ...data,
    timestamp: new Date(),
  });

  console.log(`🔔 Notification sent to user ${userId}: ${notificationType}`);
};

//
// 🔥 BROADCAST NOTIFICATION TO ALL USERS IN ROLE
//
const notifyRole = (io, role, notificationType, data) => {
  io.emit(`${role}-notification`, {
    type: notificationType,
    ...data,
    timestamp: new Date(),
  });

  console.log(`🔔 Notification sent to all ${role}s: ${notificationType}`);
};

module.exports = {
  setupSocketIO,
  notifyUser,
  notifyRole,
};
