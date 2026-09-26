const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const controller = require("./attendance.controller");
const role = require("../../middlewares/role.middleware");

router.post("/start", auth, controller.startWork);
router.post("/break/start", auth, controller.startBreak);
router.post("/break/end", auth, controller.endBreak);
router.post("/stop", auth, controller.stopWork);

// 🔹 NEW (READ APIs)
router.get("/today", auth, controller.getTodayAttendance);
router.get("/history", auth, controller.getAttendanceHistory);
router.get("/summary", auth, controller.getAttendanceSummary);

// Hr Api

router.get("/", auth, role("HR", "ADMIN"), controller.getAllAttendance);

router.get(
  "/dashboard",
  auth,
  role("HR", "ADMIN"),
  controller.getAttendanceDashboard
);

// Sidebar Appeals
router.post("/appeal-sidebar", auth, controller.appealSidebarAccess);
router.get("/appeals", auth, role("EA", "ADMIN", "HR", "COORDINATOR"), controller.getPendingAppeals);
router.post("/appeal-sidebar/:attendanceId/approve", auth, role("EA", "ADMIN", "HR", "COORDINATOR"), controller.approveSidebarAppeal);
router.post("/appeal-sidebar/:attendanceId/reject", auth, role("EA", "ADMIN", "HR", "COORDINATOR"), controller.rejectSidebarAppeal);

router.get(
  "/:employeeId",
  auth,
  role("HR", "ADMIN"),
  controller.getEmployeeAttendance
);

module.exports = router;