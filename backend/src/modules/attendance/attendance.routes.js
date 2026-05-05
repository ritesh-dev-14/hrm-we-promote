const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const controller = require("./attendance.controller");

router.post("/start", auth, controller.startWork);
router.post("/break/start", auth, controller.startBreak);
router.post("/break/end", auth, controller.endBreak);
router.post("/stop", auth, controller.stopWork);

module.exports = router;