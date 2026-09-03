const service = require("./campaign.service");

exports.createCampaign = async (req, res, next) => {
  try {
    const data = await service.createCampaign(req.user, req.params.projectId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getCampaigns = async (req, res, next) => {
  try {
    const data = await service.getCampaigns(req.user, req.params.projectId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getCampaign = async (req, res, next) => {
  try {
    const data = await service.getCampaign(req.user, req.params.campaignId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const data = await service.updateCampaign(req.user, req.params.campaignId, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const data = await service.deleteCampaign(req.user, req.params.campaignId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
