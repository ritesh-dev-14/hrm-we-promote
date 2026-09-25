const express = require("express");
const router = express.Router();
const controller = require("./admin-dashboard.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get(
  "/control-tower",
  auth,
  role("ADMIN", "HR"),
  controller.getControlTowerStats
);

module.exports = router;
