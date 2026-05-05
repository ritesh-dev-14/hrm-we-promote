// const express = require("express");
// const router = express.Router();

// const auth = require("../../middleware/auth.middleware");
// const role = require("../../middleware/role.middleware");

// const controller = require("./hr.controller");

// router.post("/manager", auth, role("HR"), controller.createManager);
// router.get("/managers", auth, role("HR"), controller.getManagers);
// router.put("/manager/:id", auth, role("HR"), controller.updateManager);
// router.delete("/manager/:id", auth, role("HR"), controller.deleteManager);

// router.get("/employees", auth, role("HR"), controller.getEmployees);

// module.exports = router;





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

router.delete("/employee/:employeeId", auth, role("HR"), controller.deleteEmployee);

module.exports = router;