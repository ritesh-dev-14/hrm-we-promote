const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const controller = require(
  "./project-tracker.controller"
);

router.get(
  "/task-items-progress",

  auth,

  role("MANAGER"),

  controller.getManagerTaskTracker
);

module.exports = router;