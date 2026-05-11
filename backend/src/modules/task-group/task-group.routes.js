const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");

const role = require("../../middlewares/role.middleware");

const validate = require("../../middlewares/validate.middleware");

const controller = require("./task-group.controller");

const {
  createGroupSchema,
  addMembersSchema,
} = require("./task-group.validation");

//
// 🔥 CREATE GROUP
//
router.post(
  "/",
  auth,

  role("MANAGER"),

  validate(createGroupSchema),

  controller.createGroup
);

//
// 🔥 ADD MEMBERS
//
router.post(
  "/:id/members",
  auth,

  role("MANAGER"),

  validate(addMembersSchema),

  controller.addMembers
);

//
// 🔥 GET GROUPS
//
router.get(
  "/",
  auth,

  role("MANAGER"),

  controller.getGroups
);

//
// 🔥 GET SINGLE GROUP
//
router.get(
  "/:id",
  auth,

  role("MANAGER"),

  controller.getGroupById
);

module.exports = router;