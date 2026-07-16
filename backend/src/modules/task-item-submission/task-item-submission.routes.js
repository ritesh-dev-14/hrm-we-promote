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

const {
  submitSchema,
  rejectSchema,
  updateProgressSchema,
  unableToSubmitSchema,
} = require(
  "./task-item-submission.validation"
);

const controller = require(
  "./task-item-submission.controller"
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
router.get(
  "/:assignmentId/verify",

  auth,

  role(
    "ADMIN",
    "HR",
    "MANAGER"
  ),

  controller.verifySubmission
);

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

// router.patch(
//   "/:assignmentId/reject",

//   auth,

//   role(
//     "ADMIN",
//     "HR",
//     "MANAGER"
//   ),

//   controller.rejectSubmission
// );

router.patch(
  "/:assignmentId/reject",

  auth,

  role(
    "ADMIN",
    "HR",
    "MANAGER"
  ),

  validate(rejectSchema),

  controller.rejectSubmission
);

//
// 🔥 UPDATE ITEM PROGRESS
//
// router.patch(
//   "/:assignmentId/progress",

//   auth,

//   role("EMPLOYEE"),

//   controller.updateItemProgress
// );

router.patch(
  "/:assignmentId/progress",

  auth,

  role("EMPLOYEE"),

  validate(updateProgressSchema),

  controller.updateItemProgress
);

//
// 🔥 UNABLE TO SUBMIT (Employee cannot submit work)
//
router.post(
  "/:assignmentId/unable-to-submit",

  auth,

  role("EMPLOYEE"),

  validate(unableToSubmitSchema),

  controller.unableToSubmit
);

//
// 🔥 RESUBMIT TASK ITEM (after manager rejection)
//
router.post(
  "/:assignmentId/resubmit",

  auth,

  role("EMPLOYEE"),

  validate(submitSchema),

  controller.resubmitTaskItem
);

module.exports = router;