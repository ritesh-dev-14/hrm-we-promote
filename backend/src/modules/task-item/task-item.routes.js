const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate =
  require("../../middlewares/validate.middleware");

const controller =
  require("./task-item.controller");

const {
  createTaskItemSchema,
  assignTaskItemSchema,
  updateTaskItemStatusSchema,
} = require("./task-item.validation");


// 🔥 CREATE TASK ITEM
router.post(
  "/:taskId",

  auth,

  role("ADMIN", "HR", "MANAGER"),

  validate(createTaskItemSchema),

  controller.createTaskItem
);


// 🔥 GET TASK ITEMS
router.get(
  "/:taskId",

  auth,

  role("ADMIN", "HR", "MANAGER"),

  controller.getTaskItems
);


// 🔥 ASSIGN TASK ITEM
router.post(
  "/:itemId/assign",

  auth,

  role("ADMIN", "HR", "MANAGER"),

  validate(assignTaskItemSchema),

  controller.assignTaskItem
);

//
// 🔥 UPDATE TASK ITEM STATUS
//
// Employee or manager updates status to: ASSIGNED, IN_PROGRESS, COMPLETED
//
router.patch(
  "/assignment/:assignmentId/status",

  auth,

  validate(updateTaskItemStatusSchema),

  controller.updateTaskItemStatus
);

//
// 🔥 UPDATE TASK ITEM DETAILS
//
router.patch(
  "/:itemId",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  controller.updateTaskItem
);

//
// 🔥 DELETE TASK ITEM
//
router.delete(
  "/:itemId",
  auth,
  role("ADMIN", "HR", "MANAGER"),
  controller.deleteTaskItem
);

module.exports = router;