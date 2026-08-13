const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./marketing-report.controller");

// Create marketing report (MANAGER only)
router.post("/", auth, role("MANAGER"), controller.createMarketingReport);

// Get all marketing reports for a project (?projectId=...)
router.get("/", auth, role("ADMIN", "HR", "EA", "MANAGER"), controller.getMarketingReports);

// Get single marketing report
router.get("/:id", auth, role("ADMIN", "HR", "EA", "MANAGER"), controller.getMarketingReportById);

// Update marketing report (MANAGER only — own reports)
router.patch("/:id", auth, role("MANAGER"), controller.updateMarketingReport);

// Delete marketing report (ADMIN/HR/EA only)
router.delete("/:id", auth, role("ADMIN", "HR", "EA"), controller.deleteMarketingReport);

module.exports = router;
