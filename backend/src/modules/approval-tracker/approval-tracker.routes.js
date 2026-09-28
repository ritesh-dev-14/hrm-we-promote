const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("./approval-tracker.controller");

router.get("/pending", auth, controller.getPendingApprovals);

module.exports = router;
