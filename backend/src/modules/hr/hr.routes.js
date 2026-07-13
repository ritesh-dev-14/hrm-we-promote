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
   updateLeaveSchema
} = require("./hr.validation");

// 🔹 Manager Routes
router.post(
  "/manager",
  auth,
  role("HR", "ADMIN"),
  validate(createManagerSchema),
  controller.createManager
);

router.get("/managers", auth, role("HR", "ADMIN"), controller.getManagers);

router.get("/manager/:employeeId", auth, role("HR", "ADMIN"), controller.getManager);

router.put(
  "/manager/:employeeId",
  auth,
  role("HR", "ADMIN"),
  validate(updateManagerSchema),
  controller.updateManager
);

router.delete("/manager/:employeeId", auth, role("HR", "ADMIN"), controller.deleteManager);

// 🔹 Employee Routes
router.post(
  "/employee",
  auth,
  role("HR", "ADMIN"),
  validate(createEmployeeSchema),
  controller.createEmployee
);

router.get("/employees", auth, role("HR", "ADMIN"), controller.getEmployees);

router.get("/employee/:employeeId", auth, role("HR", "ADMIN"), controller.getEmployee);

router.put(
  "/employee/:employeeId",
  auth,
  role("HR", "ADMIN"),
  validate(updateEmployeeSchema),
  controller.updateEmployee
);

// 🔹 Attendance (HR)
router.get(
  "/employee/:employeeId/attendance",
  auth,
  role("HR", "ADMIN"),
  controller.getEmployeeAttendance
);

router.get(
  "/employee/:employeeId/attendance/summary",
  auth,
  role("HR", "ADMIN"),
  controller.getEmployeeAttendanceSummary
);

router.delete("/employee/:employeeId", auth, role("HR", "ADMIN"), controller.deleteEmployee);

// 🔥 LEAVE MANAGEMENT

// router.get("/leaves", auth, role("HR"), controller.getAllLeaves);

// ✅ FIRST
// router.get(
//   "/leave/employee/:employeeId",
//   auth,
//   role("HR"),
//   controller.getEmployeeLeaveSummary
// );

// ✅ THEN
// router.put(
//   "/leave/:id",
//   auth,
//   role("HR"),
//   controller.updateLeaveStatus
// );




// 🔹 Get all leave requests
router.get(
  "/leaves",
  auth,
  role("HR"),
  controller.getAllLeaves
);

// 🔹 IMPORTANT: Specific routes BEFORE parameterized routes
router.get(
  "/leave/employee/:employeeId",
  auth,
  role("HR"),
  controller.getEmployeeLeaveSummary
);

// 🔹 Approve / Reject leave
router.put(
  "/leave/:id",
  auth,
  role("HR"),
  validate(updateLeaveSchema),
  controller.updateLeaveStatus
);

// 🔥 HR DASHBOARD - COMPREHENSIVE OVERVIEW
router.get(
  "/dashboard/overview",
  auth,
  role("HR", "ADMIN"),
  controller.getDashboardOverview
);

// 🔹 ADMIN DASHBOARD API - FULL VISIBILITY
router.get(
  "/dashboard/admin-overview",
  auth,
  role("ADMIN"),
  controller.getAdminDashboardOverview
);

router.get(
  "/dashboard/employees",
  auth,
  role("ADMIN"),
  controller.getAdminEmployeeProgress
);

router.get(
  "/dashboard/task-allocations",
  auth,
  role("ADMIN"),
  controller.getAdminTaskAllocations
);

router.get(
  "/dashboard/monthly-sheets",
  auth,
  role("ADMIN"),
  controller.getAdminMonthlySheets
);

router.get(
  "/dashboard/projects",
  auth,
  role("ADMIN"),
  controller.getAdminDashboardProjects
);

module.exports = router;