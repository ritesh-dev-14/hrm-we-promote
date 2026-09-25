const {
  computeProjectHealth,
  computeAllProjectHealth,
} = require("./health-score.service");

/**
 * GET /api/health-scores
 * Returns health scores for all ONGOING projects.
 * Optionally accepts ?projectIds=id1,id2,id3 to filter specific projects.
 */
exports.getAllHealthScores = async (req, res, next) => {
  try {
    const { projectIds } = req.query;

    const ids = projectIds
      ? projectIds.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    const scores = await computeAllProjectHealth(ids.length > 0 ? ids : undefined);

    res.json({
      success: true,
      data: scores,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/health-scores/:projectId
 * Returns health score for a single project.
 */
exports.getProjectHealthScore = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await computeProjectHealth(projectId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
