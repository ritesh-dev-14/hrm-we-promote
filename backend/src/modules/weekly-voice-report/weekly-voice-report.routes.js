const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./weekly-voice-report.controller");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Manager routes
router.post("/", auth, role("MANAGER"), upload.single("audio"), controller.submitReport);
router.get("/active-clients", auth, role("MANAGER"), controller.getActiveClients);
router.get("/my-reports", auth, role("MANAGER"), controller.getMyReports);

// Admin / EA routes
router.get("/", auth, role("ADMIN", "EA", "HR"), controller.getAllReports);

module.exports = router;
