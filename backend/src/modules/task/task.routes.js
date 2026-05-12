const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate = require("../../middlewares/validate.middleware");

const controller = require("./task.controller");

const {
  createTaskSchema,
  assignTaskSchema,
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
// 🔥 GET SINGLE TASK
//
router.get(
  "/:id",
  auth,

  role("ADMIN", "HR", "MANAGER"),

  controller.getTaskById
);

module.exports = router;