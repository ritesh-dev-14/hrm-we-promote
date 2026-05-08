const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const controller = require("./hr.controller");
const {
  createManagerSchema,
  updateManagerSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} = require("./hr.validation");

// 🔹 Manager Routes
router.post(
  "/manager",
  auth,
  role("HR"),
  validate(createManagerSchema),
  controller.createManager
);

router.get("/managers", auth, role("HR"), controller.getManagers);

router.get("/manager/:employeeId", auth, role("HR"), controller.getManager);

router.put(
  "/manager/:employeeId",
  auth,
  role("HR"),
  validate(updateManagerSchema),
  controller.updateManager
);

router.delete("/manager/:employeeId", auth, role("HR"), controller.deleteManager);

// 🔹 Employee Routes
router.post(
  "/employee",
  auth,
  role("HR"),
  validate(createEmployeeSchema),
  controller.createEmployee
);

router.get("/employees", auth, role("HR"), controller.getEmployees);

router.get("/employee/:employeeId", auth, role("HR"), controller.getEmployee);

router.put(
  "/employee/:employeeId",
  auth,
  role("HR"),
  validate(updateEmployeeSchema),
  controller.updateEmployee
);

// 🔹 Attendance (HR)
router.get(
  "/employee/:employeeId/attendance",
  auth,
  role("HR"),
  controller.getEmployeeAttendance
);

router.get(
  "/employee/:employeeId/attendance/summary",
  auth,
  role("HR"),
  controller.getEmployeeAttendanceSummary
);

router.delete("/employee/:employeeId", auth, role("HR"), controller.deleteEmployee);

// 🔥 LEAVE MANAGEMENT

router.get("/leaves", auth, role("HR"), controller.getAllLeaves);

router.put(
  "/leave/:id",
  auth,
  role("HR"),
  controller.updateLeaveStatus
);

router.get(
  "/leave/:employeeId",
  auth,
  role("HR"),
  controller.getEmployeeLeaveSummary
);

module.exports = router;