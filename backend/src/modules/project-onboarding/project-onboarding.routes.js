const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./project-onboarding.controller");
const { updateChecklistItemSchema } = require("./project-onboarding.validation");

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "COORDINATOR"),
  controller.getProjectOnboarding,
);

router.patch(
  "/projects/:projectId/items/:itemKey",
  auth,
  role("ADMIN", "HR", "COORDINATOR"),
  validate(updateChecklistItemSchema),
  controller.updateChecklistItem,
);

module.exports = router;
