const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate = require("../../middlewares/validate.middleware");

const controller = require(
  "./department.controller"
);

const {
  departmentSchema,
} = require(
  "./department.validation"
);

//
// 🔥 CREATE
//
router.post(
  "/",
  auth,
  role("ADMIN", "HR"),
  validate(departmentSchema),
  controller.createDepartment
);

//
// 🔥 GET ALL
//
router.get(
  "/",
  auth,
  controller.getDepartments
);

//
// 🔥 UPDATE
//
router.patch(
  "/:id",
  auth,
  role("ADMIN", "HR"),
  validate(departmentSchema),
  controller.updateDepartment
);

//
// 🔥 DELETE
//
router.delete(
  "/:id",
  auth,
  role("ADMIN", "HR"),
  controller.deleteDepartment
);

module.exports = router;