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
