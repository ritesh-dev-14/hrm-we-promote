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

// 🔹 Create Task
router.post(
  "/",
  auth,
  role("MANAGER"),
  validate(createTaskSchema),
  controller.createTask
);

// 🔹 Assign Task
router.post(
  "/:id/assign",
  auth,
  role("MANAGER"),
  validate(assignTaskSchema),
  controller.assignTask
);

// 🔹 Get Tasks
router.get(
  "/",
  auth,
  role("MANAGER"),
  controller.getTasks
);

module.exports = router;