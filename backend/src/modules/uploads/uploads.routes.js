const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./uploads.controller");
const { createUploadSchema, updateUploadSchema } = require("./uploads.validation");

router.post("/", auth, role("HR", "MANAGER"), validate(createUploadSchema), controller.createUpload);
router.get("/", auth, controller.getAllUploads);
router.get("/:id", auth, controller.getUploadById);
router.patch("/:id", auth, role("HR", "MANAGER"), validate(updateUploadSchema), controller.updateUpload);
router.delete("/:id", auth, role("HR", "MANAGER"), controller.deleteUpload);

module.exports = router;
