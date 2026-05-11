const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const controller = require("./team.controller");

//
// 🔥 GET MY EMPLOYEES
//
router.get(
  "/my-employees",

  auth,

  role("MANAGER", "HR", "ADMIN"),

  controller.getMyEmployees
);

//
// 🔥 GET EMPLOYEES BY MANAGER
//
router.get(
  "/manager/:managerId/employees",

  auth,

  role("HR", "ADMIN"),

  controller.getEmployeesByManager
);

module.exports = router;