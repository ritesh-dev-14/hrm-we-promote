const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./seo-report.controller");

const upload = multer({ storage: multer.memoryStorage() });

// Create SEO report (MANAGER, with screenshot upload)
router.post(
  "/",
  auth,
  role("MANAGER"),
  upload.single("screenshot"),
  controller.createSeoReport
);

// Get all SEO reports for a project (?projectId=...)
router.get("/", auth, role("ADMIN", "HR", "EA", "MANAGER"), controller.getSeoReports);

// Get single SEO report
router.get("/:id", auth, role("ADMIN", "HR", "EA", "MANAGER"), controller.getSeoReportById);

// Delete SEO report (admin/hr/ea only)
router.delete("/:id", auth, role("ADMIN", "HR", "EA"), controller.deleteSeoReport);

module.exports = router;
