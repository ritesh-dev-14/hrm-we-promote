const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./campaign.controller");
const { createCampaignSchema, updateCampaignSchema } = require("./campaign.validation");

const router = express.Router();
const viewers = role("ADMIN", "HR", "EA", "MANAGER");

router.post(
  "/projects/:projectId/campaigns",
  auth,
  role("MANAGER"),
  validate(createCampaignSchema),
  controller.createCampaign
);
router.get(
  "/projects/:projectId/campaigns",
  auth,
  viewers,
  controller.getCampaigns
);
router.get(
  "/campaigns/:campaignId",
  auth,
  viewers,
  controller.getCampaign
);
router.patch(
  "/campaigns/:campaignId",
  auth,
  role("MANAGER"),
  validate(updateCampaignSchema),
  controller.updateCampaign
);
router.delete(
  "/campaigns/:campaignId",
  auth,
  role("MANAGER"),
  controller.deleteCampaign
);

module.exports = router;
