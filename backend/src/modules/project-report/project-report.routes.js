const express = require("express");
const router = express.Router();
const projectReportController = require("./project-report.controller");
const validate = require("../../middlewares/validate.middleware");
const auth = require("../../middlewares/auth.middleware");
const { createReportSchema } = require("./project-report.validation");

// Submit a daily report
router.post(
  "/",
  auth,
  validate(createReportSchema),
  projectReportController.createReport
);

// Get available Web Dev projects for employees
router.get(
  "/available-projects",
  auth,
  projectReportController.getAvailableProjects
);

// Get reports for a specific project
router.get(
  "/:projectId",
  auth,
  projectReportController.getProjectReports
);

module.exports = router;
