const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("./editor-workload.controller");

router.get("/", auth, controller.getEditorWorkload);

module.exports = router;
