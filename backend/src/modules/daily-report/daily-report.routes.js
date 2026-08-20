const express = require('express');
const router = express.Router();
const dailyReportController = require('./daily-report.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/role.middleware');

/**
 * GET /api/daily-report
 *
 * Returns unified daily department report (Social Media + SEO + Marketing).
 * Accessible by ADMIN, HR, and MANAGER.
 * MANAGERs are automatically scoped to their assigned projects.
 *
 * Query params:
 *   date        - YYYY-MM-DD (default: today)
 *   department  - social_media | seo | marketing | all (default: all)
 *   projectId   - narrow to a specific project (optional)
 */
router.get(
  '/',
  protect,
  restrictTo('ADMIN', 'HR', 'MANAGER'),
  dailyReportController.getDailyReport
);

module.exports = router;
