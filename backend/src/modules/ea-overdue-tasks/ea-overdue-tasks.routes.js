const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./ea-overdue-tasks.controller");

const router = express.Router();
const permittedRoles = role("ADMIN", "HR", "EA");

router.get("/", auth, permittedRoles, controller.listOverdueTasks);
router.get("/notifications/unread", auth, permittedRoles, controller.getUnreadDigestNotification);
router.patch(
  "/notifications/:notificationId/read",
  auth,
  permittedRoles,
  controller.markDigestNotificationRead,
);

module.exports = router;
