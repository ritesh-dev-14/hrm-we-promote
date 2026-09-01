const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/role.middleware');

// Employee Route
router.get(
  '/employee/me',
  protect,
  restrictTo('EMPLOYEE', 'MANAGER', 'COORDINATOR'),
  reportController.getEmployeeStats
);

// HR / Admin Routes
router.get(
  '/hr/employees',
  protect,
  restrictTo('HR', 'ADMIN', 'MANAGER'),
  reportController.getAllEmployeesStats
);

router.get(
  '/hr/employee/:employeeId/projects',
  protect,
  restrictTo('HR', 'ADMIN', 'MANAGER'),
  reportController.getEmployeeProjectStats
);


// Projects Overview — Admin + HR only
router.get('/projects-overview', protect, restrictTo('ADMIN', 'HR', 'MANAGER'), reportController.getProjectsOverview);

// Social Media data summary for a single project or all projects
router.get(
  '/social-media-data-summary',
  protect,
  restrictTo('ADMIN', 'HR', 'MANAGER', 'COORDINATOR'),
  reportController.getSocialMediaProjectDataSummary
);

router.get(
  '/social-media-data-summary/:projectId',
  protect,
  restrictTo('ADMIN', 'HR', 'MANAGER', 'COORDINATOR'),
  reportController.getSocialMediaProjectDataSummary
);

module.exports = router;
