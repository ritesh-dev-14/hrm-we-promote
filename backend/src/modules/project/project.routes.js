const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./project.controller");
const {
  createProjectSchema,
  updateProjectSchema,
  renewProjectSchema,
} = require("./project.validation");

router.post(
  "/",
  auth,
  role("ADMIN", "HR", "EA"),
  validate(createProjectSchema),
  controller.createProject
);

router.get("/", auth, controller.getProjects);

router.get("/assigned", auth, role("MANAGER"), controller.getAssignedProjects);

router.get("/:id", auth, controller.getProjectById);

router.patch(
  "/:id",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  validate(updateProjectSchema),
  controller.updateProject
);

router.patch(
  "/:id/renew",
  auth,
  role("ADMIN", "HR", "EA"),
  validate(renewProjectSchema),
  controller.renewProject
);

router.delete(
  "/:id",
  auth,
  role("ADMIN", "HR", "EA"),
  controller.deleteProject
);

module.exports = router;
