const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const controller = require(
  "./employee-dashboard.controller"
);

// 🔥 SUMMARY
router.get(
  "/summary",
  auth,
  role("EMPLOYEE"),
  controller.getSummary
);

// 🔥 ASSIGNED ITEMS
router.get(
  "/items",
  auth,
  role("EMPLOYEE"),
  controller.getAssignedItems
);

// 🔥 SUBMISSIONS
router.get(
  "/submissions",
  auth,
  role("EMPLOYEE"),
  controller.getSubmissions
);

module.exports = router;