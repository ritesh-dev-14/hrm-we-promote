const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./department-report.controller");

const router = express.Router();

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getDepartmentReports
);

module.exports = router;