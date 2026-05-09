// const express = require("express");

// const router = express.Router();

// const auth = require("../../middlewares/auth.middleware");

// const role = require("../../middlewares/role.middleware");

// const validate =
// require("../../middlewares/validate.middleware");

// const controller =
// require("./task-item.controller");

// const {
//   createTaskItemSchema,
//   assignTaskItemSchema
// } = require("./task-item.validation");

// router.post(
//   "/:taskId",
//   auth,
//   role("MANAGER"),
//   validate(createTaskItemSchema),
//   controller.createTaskItem
// );

// router.post(
//   "/assign/:taskItemId",
//   auth,
//   role("MANAGER"),
//   validate(assignTaskItemSchema),
//   controller.assignTaskItem
// );

// router.get(
//   "/my",
//   auth,
//   role("EMPLOYEE"),
//   controller.getMyTaskItems
// );

// module.exports = router;



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

module.exports = router;