const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("./sidebar-unread.controller");

// GET /api/sidebar-unread — returns unread counts for the logged-in user
router.get("/", auth, controller.getUnreads);

// POST /api/sidebar-unread/reset — resets unread count for a specific menuId
router.post("/reset", auth, controller.resetUnread);

module.exports = router;
