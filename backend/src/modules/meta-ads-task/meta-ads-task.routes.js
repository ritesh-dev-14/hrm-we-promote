const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./meta-ads-task.controller");
const {
  createMetaAdsTaskSchema,
  assignMetaAdsTaskSchema,
  updateMetaAdsTaskSchema,
} = require("./meta-ads-task.validation");

const router = express.Router();

router.post(
  "/",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  validate(createMetaAdsTaskSchema),
  controller.createMetaAdsTask
);

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getMetaAdsTasks
);

router.get(
  "/:id",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getMetaAdsTaskById
);

router.post(
  "/:id/assign",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  validate(assignMetaAdsTaskSchema),
  controller.assignMetaAdsTask
);

router.patch(
  "/:id",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  validate(updateMetaAdsTaskSchema),
  controller.updateMetaAdsTask
);

module.exports = router;
