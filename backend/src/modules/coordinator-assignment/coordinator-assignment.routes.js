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
  createCoordinatorTaskSchema,
} = require("./coordinator-assignment.validation");
const {
  sendFollowUpMessageSchema,
  replyFollowUpMessageSchema,
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
// 🔥 CREATE COORDINATOR TASK (By Any User)
// Employees, HR, Managers can create requirements/tasks for coordinator
//
router.post(
  "/create-requirement",
  auth,
  validate(createCoordinatorTaskSchema),
  controller.createCoordinatorTask
);

//
// 🔥 GET MY TASKS (For Coordinator)
// Get all tasks/requirements assigned to THIS coordinator
//
router.get(
  "/my-tasks",
  auth,
  role("COORDINATOR"),
  controller.getMyTasks
);

//
// 🔥 GET TASKS CREATED BY CURRENT USER
// Employee/Manager/HR can fetch coordinator tasks they created
//
router.get(
  "/my-created",
  auth,
  controller.getMyCreatedTasks
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

// Follow-up messaging endpoints (must come before "/:assignmentId")
router.post(
  "/:assignmentId/follow-up",
  auth,
  role("COORDINATOR"),
  validate(sendFollowUpMessageSchema),
  controller.sendFollowUpMessage
);

router.patch(
  "/:assignmentId/reply",
  auth,
  validate(replyFollowUpMessageSchema),
  controller.replyToFollowUp
);

router.get(
  "/:assignmentId/follow-up-messages",
  auth,
  controller.getFollowUpMessages
);

//
// 🔥 GET ALL COORDINATORS
// Accessible to all authenticated users except coordinators
//
router.get(
  "/coordinators",
  auth,
  controller.getAllCoordinators
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
