const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const controller = require("./employee.controller");

// 🔹 Get Assigned Tasks
router.get("/tasks", auth, controller.getTasks);

// 🔹 Submit Task
router.post("/task/:id/submit", auth, controller.submitTask);

module.exports = router;