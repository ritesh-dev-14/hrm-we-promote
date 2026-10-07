const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("./editor-workload.controller");

router.get("/", auth, controller.getEditorWorkload);
router.put("/:id/targets", auth, controller.updateEditorTargets);

module.exports = router;
