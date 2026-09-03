const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

const controller = require("./manager.controller");

router.post("/employee", auth, role("MANAGER"), controller.createEmployee);
router.get("/employees", auth, role("MANAGER"), controller.getEmployees);
router.put("/employee/:id", auth, role("MANAGER"), controller.updateEmployee);
router.delete("/employee/:id", auth, role("MANAGER"), controller.deleteEmployee);

router.get(
  "/my-employees",
  auth,
  role("MANAGER"),
  controller.getMyEmployees
);

router.get(
  "/dashboard",
  auth,
  role("MANAGER"),
  controller.getDashboardStats
);

// 🔒 MANAGER LOGOUT GUARD
// Returns canLogout status + pending EA tasks + missing marketing reports
router.get(
  "/logout-status",
  auth,
  role("MANAGER"),
  controller.getLogoutStatus
);

module.exports = router;