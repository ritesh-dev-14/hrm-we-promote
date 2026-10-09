const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { corsOptions } = require("./cors");

const prisma = new PrismaClient();

//
// 🔥 SETUP SOCKET.IO FOR REAL-TIME NOTIFICATIONS
//
const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      ...corsOptions,
      methods: ["GET", "POST"],
    },
  });

  //
  // 🔥 SOCKET CONNECTION
  //
  io.on("connection", (socket) => {


    //
    // 🔥 JOIN USER ROOM - So we can send specific notifications
    //
    socket.on("join-user", (data) => {
      const { userId } = data;
      socket.join(`user-${userId}`);

    });

    //
    // 🔥 LEAVE USER ROOM
    //
    socket.on("leave-user", (data) => {
      const { userId } = data;
      socket.leave(`user-${userId}`);

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
      
    });

    //
    // 🔥 DISCONNECT
    //
    socket.on("disconnect", () => {

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


};

module.exports = {
  setupSocketIO,
  notifyUser,
  notifyRole,
};
