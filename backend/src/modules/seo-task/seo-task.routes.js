const express = require("express");
const multer = require("multer");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./seo-task.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  auth,
  role("MANAGER"),
  upload.single("screenshot"),
  controller.createSeoTask
);

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getSeoTasks
);

module.exports = router;
