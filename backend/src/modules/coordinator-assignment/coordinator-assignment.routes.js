const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate =
  require("../../middlewares/validate.middleware");

const controller =
  require("./coordinator-assignment.controller");

const {
  createAssignmentSchema,
  updateAssignmentStatusSchema,
} = require("./coordinator-assignment.validation");

//
// 🔥 CREATE COORDINATOR ASSIGNMENT
// Only COORDINATOR can create assignments
//
router.post(
  "/",
  auth,
  role("COORDINATOR"),
  validate(createAssignmentSchema),
  controller.createAssignment
);

//
// 🔥 GET ASSIGNMENTS BY COORDINATOR
// Get all assignments created by this coordinator
//
router.get(
  "/my-assignments",
  auth,
  role("COORDINATOR"),
  controller.getAssignmentsByCoordinator
);

//
// 🔥 GET ASSIGNMENTS ASSIGNED TO A USER
// Get all tasks assigned to a specific user
//
router.get(
  "/assigned-to/:userId",
  auth,
  controller.getAssignmentsByAssignedTo
);

//
// 🔥 GET ALL USERS (HR, MANAGER, EMPLOYEES)
// Coordinator can see all users to assign tasks to
//
router.get(
  "/users/list",
  auth,
  role("COORDINATOR"),
  controller.getAllUsers
);

//
// 🔥 GET SINGLE ASSIGNMENT
// Get assignment details
//
router.get(
  "/:assignmentId",
  auth,
  controller.getAssignmentById
);

//
// 🔥 UPDATE ASSIGNMENT STATUS
// Update status and reason for an assignment
//
router.patch(
  "/:assignmentId/status",
  auth,
  validate(updateAssignmentStatusSchema),
  controller.updateAssignmentStatus
);

//
// 🔥 LIST ALL ASSIGNMENTS
// Admin and Coordinator can list all assignments (with filters)
//
router.get(
  "/",
  auth,
  role("COORDINATOR", "ADMIN"),
  controller.listAllAssignments
);

module.exports = router;
