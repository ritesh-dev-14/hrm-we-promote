const service = require("./shoot-workspace.service");

exports.createShootWorkspace = async (req, res, next) => {
  try {
    const data = await service.createShootWorkspace(req.user, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootWorkspaces = async (req, res, next) => {
  try {
    const data = await service.getShootWorkspaces(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootManagementSummary = async (req, res, next) => {
  try {
    const data = await service.getShootManagementSummary(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getWorkspaceUploadFeed = async (req, res, next) => {
  try {
    const data = await service.getWorkspaceUploadFeed(req.user, req.params.workspaceId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.approveEditorItemByClient = async (req, res, next) => {
  try {
    const data = await service.approveEditorItemByClient(req.user, req.params.workspaceId, req.params.itemId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.markEditorItemUploaded = async (req, res, next) => {
  try {
    const data = await service.markEditorItemUploaded(req.user, req.params.workspaceId, req.params.itemId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootWorkspaceById = async (req, res, next) => {
  try {
    const data = await service.getShootWorkspaceById(req.user, req.params.workspaceId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateShootWorkspace = async (req, res, next) => {
  try {
    const data = await service.updateShootWorkspace(req.user, req.params.workspaceId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteShootWorkspace = async (req, res, next) => {
  try {
    const data = await service.deleteShootWorkspace(req.user, req.params.workspaceId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.addShootWorkspaceMembers = async (req, res, next) => {
  try {
    const data = await service.addShootWorkspaceMembers(req.user, req.params.workspaceId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.removeShootWorkspaceMember = async (req, res, next) => {
  try {
    const data = await service.removeShootWorkspaceMember(req.user, req.params.workspaceId, req.params.memberId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.assignShootTaskEmployees = async (req, res, next) => {
  try {
    const data = await service.assignShootTaskEmployees(
      req.user,
      req.params.workspaceId,
      req.params.taskId,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.removeShootTaskEmployee = async (req, res, next) => {
  try {
    const data = await service.removeShootTaskEmployee(
      req.user,
      req.params.workspaceId,
      req.params.taskId,
      req.params.employeeId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.submitShootExtraContent = async (req, res, next) => {
  try {
    const data = await service.submitShootExtraContent(
      req.user,
      req.params.workspaceId,
      req.params.taskId,
      req.body
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootExtraContent = async (req, res, next) => {
  try {
    const data = await service.getShootExtraContent(
      req.user,
      req.params.workspaceId,
      req.params.taskId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createShootTask = async (req, res, next) => {
  try {
    const data = await service.createShootTask(req.user, req.params.workspaceId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootTasks = async (req, res, next) => {
  try {
    const data = await service.getShootTasks(req.user, req.params.workspaceId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMyShootTasks = async (req, res, next) => {
  try {
    const data = await service.getMyShootTasks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getManagerShootSubmissions = async (req, res, next) => {
  try {
    const data = await service.getManagerShootSubmissions(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootTaskById = async (req, res, next) => {
  try {
    const data = await service.getShootTaskById(req.user, req.params.workspaceId, req.params.taskId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateShootTask = async (req, res, next) => {
  try {
    const data = await service.updateShootTask(req.user, req.params.workspaceId, req.params.taskId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteShootTask = async (req, res, next) => {
  try {
    const data = await service.deleteShootTask(req.user, req.params.workspaceId, req.params.taskId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createShootSubTask = async (req, res, next) => {
  try {
    const data = await service.createShootSubTask(req.user, req.params.workspaceId, req.params.taskId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.submitShootSubTask = async (req, res, next) => {
  try {
    const data = await service.submitShootSubTask(
      req.user,
      req.params.workspaceId,
      req.params.taskId,
      req.params.subtaskId,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.reviewShootSubTask = async (req, res, next) => {
  try {
    const data = await service.reviewShootSubTask(
      req.user,
      req.params.workspaceId,
      req.params.taskId,
      req.params.subtaskId,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootSubTasks = async (req, res, next) => {
  try {
    const data = await service.getShootSubTasks(req.user, req.params.workspaceId, req.params.taskId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getShootSubTaskById = async (req, res, next) => {
  try {
    const data = await service.getShootSubTaskById(req.user, req.params.workspaceId, req.params.taskId, req.params.subtaskId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateShootSubTask = async (req, res, next) => {
  try {
    const data = await service.updateShootSubTask(req.user, req.params.workspaceId, req.params.taskId, req.params.subtaskId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteShootSubTask = async (req, res, next) => {
  try {
    const data = await service.deleteShootSubTask(req.user, req.params.workspaceId, req.params.taskId, req.params.subtaskId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
