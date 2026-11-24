const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./marketing-report.controller");


// Create marketing report (MANAGER only)
router.post("/", auth, role("MANAGER"), controller.createMarketingReport);

// Get all marketing reports for a project (?projectId=...)
router.get("/submitted-projects", auth, role("ADMIN", "HR"), controller.getSubmittedProjectIds);
router.get("/submission-details", auth, role("ADMIN", "HR"), controller.getSubmissionDetails);
router.get("/pending-count", auth, role("ADMIN", "HR", "EA", "COORDINATOR"), controller.getPendingMarketingReportCount);
router.get("/", auth, role("ADMIN", "HR", "EA", "COORDINATOR", "MANAGER"), controller.getMarketingReports);

// Get single marketing report
router.get("/:id", auth, role("ADMIN", "HR", "EA", "COORDINATOR", "MANAGER"), controller.getMarketingReportById);

// Update marketing report (MANAGER only — own reports)
router.patch("/:id", auth, role("MANAGER"), controller.updateMarketingReport);

// HR/Admin approve or reject today's marketing report
router.patch("/:id/review", auth, role("HR", "ADMIN", "EA", "COORDINATOR"), controller.reviewMarketingReport);

// Delete marketing report (ADMIN/HR/EA only)
router.delete("/:id", auth, role("ADMIN", "HR", "EA"), controller.deleteMarketingReport);

module.exports = router;
