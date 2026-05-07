const express = require("express");
const router = express.Router();

const controller = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { loginSchema } = require("./auth.validation");

router.post("/login", validate(loginSchema), controller.login);

module.exports = router;