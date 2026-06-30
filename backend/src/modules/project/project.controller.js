const service = require("./project.service");

exports.createProject = async (req, res, next) => {
  try {
    const data = await service.createProject(req.user, req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const data = await service.getProjects(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAssignedProjects = async (req, res, next) => {
  try {
    const data = await service.getAssignedProjects(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const data = await service.getProjectById(req.user, req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const data = await service.updateProject(
      req.user,
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.renewProject = async (req, res, next) => {
  try {
    const data = await service.renewProject(
      req.user,
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const data = await service.deleteProject(req.user, req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
