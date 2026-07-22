const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./payslip.controller");
const {
  uploadPayslipSchema,
  getPayslipsSchema,
  updatePayslipSchema,
} = require("./payslip.validation");

// HR/Admin: Upload a new payslip for an employee
router.post(
  "/",
  auth,
  role("ADMIN", "HR", "EA"),
  upload.single("image"),
  validate(uploadPayslipSchema),
  controller.uploadPayslip
);

// HR/Admin: Get all uploaded payslips (with filtering and pagination)
router.get(
  "/",
  auth,
  role("ADMIN", "HR", "EA"),
  validate(getPayslipsSchema),
  controller.getAllPayslips
);

// HR/Admin: Get all users/employees list for dropdown
router.get(
  "/users",
  auth,
  role("ADMIN", "HR", "EA"),
  controller.getUsersForPayslip
);

// Employee/Manager/User: Get logged-in user's own payslips
router.get(
  "/my-payslips",
  auth,
  controller.getMyPayslips
);

// Get single payslip by ID
router.get(
  "/:id",
  auth,
  controller.getPayslipById
);

// HR/Admin: Update existing payslip
router.patch(
  "/:id",
  auth,
  role("ADMIN", "HR", "EA"),
  upload.single("image"),
  validate(updatePayslipSchema),
  controller.updatePayslip
);

// HR/Admin: Delete a payslip
router.delete(
  "/:id",
  auth,
  role("ADMIN", "HR", "EA"),
  controller.deletePayslip
);

module.exports = router;
