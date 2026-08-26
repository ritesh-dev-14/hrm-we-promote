const express = require('express');
const router = express.Router();
const dailyReportController = require('./daily-report.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/role.middleware');

router.get(
  '/',
  protect,
  restrictTo('ADMIN', 'HR', 'MANAGER'),
  dailyReportController.getDailyReport
);

module.exports = router;
