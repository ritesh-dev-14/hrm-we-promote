const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate = require("../../middlewares/validate.middleware");

const controller = require("./task.controller");

const {
  createTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
} = require("./task.validation");

//
// 🔥 CREATE TASK
//
router.post(
  "/",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  validate(createTaskSchema),
  controller.createTask
);

//
// 🔥 GET MY ASSIGNED TASKS
//
router.get(
  "/my-tasks",
  auth,
  controller.getMyAssignedTasks
);

//
// 🔥 ASSIGN TASK
//
router.post(
  "/:id/assign",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  validate(assignTaskSchema),
  controller.assignTask
);

//
// 🔥 GET ALL TASKS
//
router.get(
  "/",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  controller.getTasks
);

//
// 🔥 GET TASK ITEMS WITH ALL DETAILS (For Manager)
//
router.get(
  "/:taskId/items",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  controller.getTaskItemsWithDetails
);

//
// 🔥 GET SINGLE TASK
//
router.get(
  "/:id",
  auth,
  controller.getTaskById
);

//
// 🔥 UPDATE TASK ASSIGNMENT STATUS
//
router.patch(
  "/assignment/:assignmentId/status",
  auth,
  validate(updateTaskStatusSchema),
  controller.updateTaskAssignmentStatus
);

module.exports = router;