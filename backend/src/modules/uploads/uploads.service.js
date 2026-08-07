const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const mailService = require("../mail/mail.service");
const { incrementUnread } = require("../../services/sidebarUnread.service");

const canManageUploads = (role) => ["HR", "MANAGER"].includes((role || "").toUpperCase());

// All roles that should receive upload notifications
const NOTIFIABLE_ROLES = ["EMPLOYEE", "MANAGER", "ADMIN", "HR", "COORDINATOR", "EA"];

/**
 * Notify ALL users (every role) about a today's upload.
 * Sends: in-app notification (DB), sidebar unread increment, socket popup, and email.
 */
const notifyAllUsersAboutUpload = async (upload) => {
  const allUsers = await prisma.user.findMany({
    where: { role: { in: NOTIFIABLE_ROLES } },
    select: { id: true, name: true, email: true, role: true },
  });

  const uploadDateFormatted = new Date(upload.uploadDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const itemSummary = (upload.items || [])
    .map((i) => `${i.dataType}${i.platform ? ` (${i.platform})` : ""}`)
    .join(", ");

  const notificationTitle = "📌 Today's Upload Alert";
  const notificationMessage = `Today's upload for "${upload.projectName}" (Client: ${upload.clientName || "N/A"}) is now available. Total: ${upload.totalUploads} uploads${itemSummary ? ` — ${itemSummary}` : ""}. Please review the details.`;

  for (const targetUser of allUsers) {
    // 1. Create in-app DB notification
    try {
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          title: notificationTitle,
          message: notificationMessage,
          type: "TODAY_UPLOAD",
          level: "INFO",
          entityId: upload.id,
        },
      });
    } catch (err) {
      console.error(`[Uploads] Failed to create notification for user ${targetUser.id}:`, err.message);
    }

    // 2. Increment sidebar unread badge
    incrementUnread(targetUser.id, "projects").catch(() => {});

    // 3. Emit real-time WebSocket popup to the specific user's room
    if (global.io) {
      global.io.to(`user-${targetUser.id}`).emit("today-upload-popup", {
        type: "TODAY_UPLOAD",
        title: notificationTitle,
        message: notificationMessage,
        uploadId: upload.id,
        projectName: upload.projectName,
        clientName: upload.clientName,
        totalUploads: upload.totalUploads,
        uploadDate: upload.uploadDate,
        items: upload.items || [],
        timestamp: new Date(),
      });
    }

    // 4. Send email notification
    if (targetUser.email) {
      mailService
        .sendTodayUploadNotification({
          email: targetUser.email,
          userName: targetUser.name,
          projectName: upload.projectName,
          uploadDate: uploadDateFormatted,
          clientName: upload.clientName,
          totalUploads: upload.totalUploads,
          items: upload.items || [],
          applicationUrl: process.env.APP_URL || "http://localhost:5173",
        })
        .catch((err) =>
          console.error(
            `[Mail] Failed to send today upload email to ${targetUser.email}:`,
            err.message
          )
        );
    }
  }

  console.log(`[Uploads] Notified ${allUsers.length} users about today's upload: "${upload.projectName}"`);
};

/**
 * Check if a given date (Date object or ISO string) is today in IST (Asia/Kolkata).
 */
const isTodayInIST = (date) => {
  const d = new Date(date);
  const today = new Date();
  const opts = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
  return d.toLocaleDateString("en-IN", opts) === today.toLocaleDateString("en-IN", opts);
};

exports.createUpload = async (user, body) => {
  if (!canManageUploads(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const upload = await prisma.upload.create({
    data: {
      projectName: body.projectName,
      uploadDate: new Date(body.uploadDate),
      clientName: body.clientName,
      totalUploads: Number(body.totalUploads || 0),
      createdById: user.id,
      items: {
        create: (body.items || []).map((item) => ({
          dataType: item.dataType,
          platform: item.platform || null,
        })),
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
    },
  });

  // Fire notifications for EVERYONE (EMPLOYEE, MANAGER, ADMIN, HR, COORDINATOR, EA)
  // if the upload date is today (IST-safe comparison)
  if (isTodayInIST(upload.uploadDate)) {
    notifyAllUsersAboutUpload(upload).catch((err) =>
      console.error("[Uploads] Notification error on createUpload:", err.message)
    );
  }

  return upload;
};

exports.getAllUploads = async (user, query = {}) => {
  if (!user || !user.role) {
    throw new ApiError(401, ERRORS.AUTH.UNAUTHORIZED);
  }

  const allowed = ["HR", "MANAGER", "EMPLOYEE", "COORDINATOR", "EA", "ADMIN"];
  if (!allowed.includes((user.role || "").toUpperCase())) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const uploads = await prisma.upload.findMany({
    orderBy: [{ uploadDate: "desc" }, { createdAt: "desc" }],
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
    },
  });

  return uploads;
};

exports.getUploadById = async (user, id) => {
  if (!user || !user.role) {
    throw new ApiError(401, ERRORS.AUTH.UNAUTHORIZED);
  }

  const upload = await prisma.upload.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
    },
  });

  if (!upload) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Upload entry not found.",
    });
  }

  if (!canManageUploads(user.role) && !["EMPLOYEE", "COORDINATOR", "EA"].includes((user.role || "").toUpperCase())) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return upload;
};

exports.updateUpload = async (user, id, body) => {
  if (!canManageUploads(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existing = await prisma.upload.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Upload entry not found.",
    });
  }

  const updateData = {};
  if (body.projectName !== undefined) updateData.projectName = body.projectName;
  if (body.uploadDate !== undefined) updateData.uploadDate = new Date(body.uploadDate);
  if (body.clientName !== undefined) updateData.clientName = body.clientName;
  if (body.totalUploads !== undefined) updateData.totalUploads = Number(body.totalUploads);

  const upload = await prisma.$transaction(async (tx) => {
    const updated = await tx.upload.update({
      where: { id },
      data: updateData,
      include: { createdBy: { select: { id: true, name: true, email: true, role: true } }, items: true },
    });

    if (Array.isArray(body.items)) {
      const incomingIds = body.items.filter((item) => item.id).map((item) => item.id);
      await tx.uploadItem.deleteMany({ where: { uploadId: id, NOT: { id: { in: incomingIds } } } });

      for (const item of body.items) {
        if (item.id) {
          await tx.uploadItem.update({
            where: { id: item.id },
            data: { dataType: item.dataType, platform: item.platform || null },
          });
        } else {
          await tx.uploadItem.create({
            data: {
              uploadId: id,
              dataType: item.dataType,
              platform: item.platform || null,
            },
          });
        }
      }
    }

    return tx.upload.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true, role: true } }, items: true },
    });
  });

  // If the upload date was changed to today, fire notifications for everyone
  if (upload && isTodayInIST(upload.uploadDate)) {
    notifyAllUsersAboutUpload(upload).catch((err) =>
      console.error("[Uploads] Notification error on updateUpload:", err.message)
    );
  }

  return upload;
};

exports.deleteUpload = async (user, id) => {
  if (!canManageUploads(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existing = await prisma.upload.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Upload entry not found.",
    });
  }

  await prisma.upload.delete({ where: { id } });

  return { message: "Upload entry deleted successfully" };
};
