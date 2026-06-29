const express = require("express");
const router = express.Router({ mergeParams: true });

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./project-monthly-sheet.controller");
const {
  createProjectMonthlySheetSchema,
  updateProjectMonthlySheetSchema,
} = require("./project-monthly-sheet.validation");

router.post(
  "/",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  validate(createProjectMonthlySheetSchema),
  controller.createProjectMonthlySheet
);

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getProjectMonthlySheets
);

router.get(
  "/:sheetId",
  auth,
  role("ADMIN", "HR", "EA", "MANAGER"),
  controller.getProjectMonthlySheetById
);

router.patch(
  "/:sheetId",
  auth,
  role("MANAGER"),
  validate(updateProjectMonthlySheetSchema),
  controller.updateProjectMonthlySheet
);

module.exports = router;
