const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./marketing-monthly-report.controller");

router.get("/projects", auth, role("ADMIN", "HR", "EA", "MANAGER"), controller.getMarketingProjects);
router.post("/", auth, role("MANAGER"), controller.create);
router.get("/", auth, role("ADMIN", "HR", "EA", "MANAGER"), controller.get);
router.patch("/:id", auth, role("MANAGER"), controller.update);
router.post("/:id/remarks", auth, role("MANAGER"), controller.addRemark);
router.delete("/remarks/:remarkId", auth, role("MANAGER"), controller.deleteRemark);

module.exports = router;
