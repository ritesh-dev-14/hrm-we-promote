const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./employee.controller");
const { applyLeaveSchema } = require("./employee.validation");

// 🔹 Get Assigned Tasks
router.get("/tasks", auth, controller.getTasks);

// 🔹 Submit Task
router.post("/task/:id/submit", auth, controller.submitTask);

// 🔹 EXISTING
router.get("/tasks", auth, controller.getTasks);
router.post("/task/:id/submit", auth, controller.submitTask);

// 🔥 NEW (LEAVE)
router.post("/leave", auth, validate(applyLeaveSchema), controller.applyLeave);
router.get("/leaves", auth, controller.getMyLeaves);
router.get("/leave-balance", auth, controller.getMyLeaveBalance);

module.exports = router;