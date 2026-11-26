const service = require("./project-onboarding.service");

exports.getProjectOnboarding = async (req, res, next) => {
  try {
    const data = await service.getProjectOnboarding(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const data = await service.updateProjectOnboardingItem(
      req.user,
      req.params.projectId,
      req.params.itemKey,
      req.body.completed,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
