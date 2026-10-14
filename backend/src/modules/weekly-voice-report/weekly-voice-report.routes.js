const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./weekly-voice-report.controller");

const multer = require("multer");
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }
});

// Manager routes
router.post(
  "/",
  auth,
  role("MANAGER"),
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "screenshots", maxCount: 30 },
  ]),
  controller.submitReport
);
router.get("/active-clients", auth, role("MANAGER"), controller.getActiveClients);
router.get("/my-reports", auth, role("MANAGER"), controller.getMyReports);

// Admin / EA / HR / QA routes
router.get("/", auth, role("ADMIN", "EA", "HR", "QA"), controller.getAllReports);

// QA Meta Ads Tracking and Review routes
router.get("/qa/meta-ads-tracking", auth, role("QA", "ADMIN", "EA", "HR"), controller.getQAMetaAdsTracking);
router.patch("/:id/qa-review", auth, role("QA", "ADMIN", "EA"), controller.reviewReportByQA);

module.exports = router;
