const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./manager-incentive.controller");

const router = express.Router();

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "COORDINATOR"),
  controller.getScoreReport,
);

module.exports = router;
