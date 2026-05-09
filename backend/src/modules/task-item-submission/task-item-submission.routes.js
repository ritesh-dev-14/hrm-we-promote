// const express = require("express");

// const router = express.Router();

// const auth = require("../../middlewares/auth.middleware.js");

// const role = require("../../middlewares/role.middleware.js");

// const validate =
// require("../../middlewares/validate.middleware.js");

// const controller =
// require("./task-item-submission.controller.js.js");

// const {
//   submitSchema
// } = require("./task-item-submission.validation.js");

// router.post(
//   "/:assignmentId",
//   auth,
//   role("EMPLOYEE"),
//   validate(submitSchema),
//   controller.submitTaskItem
// );

// router.post(
//   "/verify/:submissionId",
//   auth,
//   role("MANAGER"),
//   controller.verifySubmission
// );

// module.exports = router;


const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate = require("../../middlewares/validate.middleware");

const controller = require(
  "./task-item-submission.controller"
);

const {
  submitSchema,
} = require(
  "./task-item-submission.validation"
);

// 🔥 GET MY ASSIGNED ITEMS
router.get(
  "/my-items",

  auth,

  role("EMPLOYEE"),

  controller.getMyAssignedItems
);

// 🔥 SUBMIT TASK ITEM
router.post(
  "/:assignmentId/submit",

  auth,

  role("EMPLOYEE"),

  validate(submitSchema),

  controller.submitTaskItem
);

// 🔥 VERIFY SUBMISSION
router.patch(
  "/:assignmentId/verify",

  auth,

  role(
    "ADMIN",
    "HR",
    "MANAGER"
  ),

  controller.verifySubmission
);

module.exports = router;