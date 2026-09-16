const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./shoot-workspace.controller");
const {
  createShootWorkspaceSchema,
  updateShootWorkspaceSchema,
  addWorkspaceMembersSchema,
  assignShootTaskEmployeesSchema,
  submitShootExtraContentSchema,
  createShootTaskSchema,
  updateShootTaskSchema,
  createShootSubTaskSchema,
  updateShootSubTaskSchema,
  submitShootSubTaskSchema,
  reviewShootSubTaskSchema,
} = require("./shoot-workspace.validation");

router.post(
  "/",
  auth,
  role("MANAGER"),
  validate(createShootWorkspaceSchema),
  controller.createShootWorkspace
);

router.get(
  "/",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootWorkspaces
);

router.get(
  "/my-tasks",
  auth,
  controller.getMyShootTasks
);

router.get(
  "/management-summary",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootManagementSummary
);

router.get(
  "/:workspaceId",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootWorkspaceById
);

router.patch(
  "/:workspaceId",
  auth,
  role("MANAGER"),
  validate(updateShootWorkspaceSchema),
  controller.updateShootWorkspace
);

router.delete(
  "/:workspaceId",
  auth,
  role("MANAGER"),
  controller.deleteShootWorkspace
);

router.post(
  "/:workspaceId/members",
  auth,
  role("MANAGER"),
  validate(addWorkspaceMembersSchema),
  controller.addShootWorkspaceMembers
);

router.delete(
  "/:workspaceId/members/:memberId",
  auth,
  role("MANAGER"),
  controller.removeShootWorkspaceMember
);

router.post(
  "/:workspaceId/tasks/:taskId/assignees",
  auth,
  role("MANAGER"),
  validate(assignShootTaskEmployeesSchema),
  controller.assignShootTaskEmployees
);

router.delete(
  "/:workspaceId/tasks/:taskId/assignees/:employeeId",
  auth,
  role("MANAGER"),
  controller.removeShootTaskEmployee
);

router.post(
  "/:workspaceId/tasks/:taskId/extra-content",
  auth,
  role("EMPLOYEE"),
  validate(submitShootExtraContentSchema),
  controller.submitShootExtraContent
);

router.get(
  "/:workspaceId/tasks/:taskId/extra-content",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootExtraContent
);

router.post(
  "/:workspaceId/tasks",
  auth,
  role("MANAGER"),
  validate(createShootTaskSchema),
  controller.createShootTask
);

router.get(
  "/:workspaceId/tasks",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootTasks
);

router.get(
  "/:workspaceId/tasks/:taskId",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootTaskById
);

router.patch(
  "/:workspaceId/tasks/:taskId",
  auth,
  role("MANAGER"),
  validate(updateShootTaskSchema),
  controller.updateShootTask
);

router.delete(
  "/:workspaceId/tasks/:taskId",
  auth,
  role("MANAGER"),
  controller.deleteShootTask
);

router.post(
  "/:workspaceId/tasks/:taskId/subtasks",
  auth,
  role("MANAGER"),
  validate(createShootSubTaskSchema),
  controller.createShootSubTask
);

router.post(
  "/:workspaceId/tasks/:taskId/subtasks/:subtaskId/submit",
  auth,
  role("EMPLOYEE"),
  validate(submitShootSubTaskSchema),
  controller.submitShootSubTask
);

router.post(
  "/:workspaceId/tasks/:taskId/subtasks/:subtaskId/review",
  auth,
  role("MANAGER", "ADMIN", "HR", "COORDINATOR"),
  validate(reviewShootSubTaskSchema),
  controller.reviewShootSubTask
);

router.get(
  "/:workspaceId/tasks/:taskId/subtasks",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootSubTasks
);

router.get(
  "/:workspaceId/tasks/:taskId/subtasks/:subtaskId",
  auth,
  role("ADMIN", "HR", "MANAGER", "EMPLOYEE"),
  controller.getShootSubTaskById
);

router.patch(
  "/:workspaceId/tasks/:taskId/subtasks/:subtaskId",
  auth,
  role("MANAGER"),
  validate(updateShootSubTaskSchema),
  controller.updateShootSubTask
);

router.delete(
  "/:workspaceId/tasks/:taskId/subtasks/:subtaskId",
  auth,
  role("MANAGER"),
  controller.deleteShootSubTask
);

module.exports = router;
