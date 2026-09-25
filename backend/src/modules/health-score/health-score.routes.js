const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./health-score.controller");

// GET /api/health-scores  — all projects (ADMIN, HR, EA only)
router.get(
  "/",
  auth,
  role("ADMIN", "HR", "EA"),
  controller.getAllHealthScores
);

// GET /api/health-scores/:projectId  — single project
router.get(
  "/:projectId",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getProjectHealthScore
);

module.exports = router;
