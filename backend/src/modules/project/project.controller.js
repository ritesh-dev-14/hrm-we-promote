const service = require("./project.service");
const cloudinary = require("../../utils/cloudinary");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

exports.createProject = async (req, res, next) => {
  try {
    req.body = req.body || {};

    if (req.file) {
      if (!req.file.buffer) {
        return next(
          new ApiError(400, {
            code: ERRORS.VALIDATION.INVALID_INPUT.code,
            message: "Uploaded logo file is invalid or empty.",
          })
        );
      }

      try {
        const result = await cloudinary.uploadBuffer(req.file.buffer, {
          folder: "projects",
          resource_type: "image",
        });

        req.body.logo = result.secure_url;
      } catch (uploadError) {
        return next(
          new ApiError(500, {
            code: ERRORS.SERVER.INTERNAL_ERROR.code,
            message: `Logo upload failed: ${uploadError.message}`,
          })
        );
      }
    }

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
    req.body = req.body || {};

    if (req.file) {
      if (!req.file.buffer) {
        return next(
          new ApiError(400, {
            code: ERRORS.VALIDATION.INVALID_INPUT.code,
            message: "Uploaded logo file is invalid or empty.",
          })
        );
      }

      try {
        const result = await cloudinary.uploadBuffer(req.file.buffer, {
          folder: "projects",
          resource_type: "image",
        });

        req.body.logo = result.secure_url;
      } catch (uploadError) {
        return next(
          new ApiError(500, {
            code: ERRORS.SERVER.INTERNAL_ERROR.code,
            message: `Logo upload failed: ${uploadError.message}`,
          })
        );
      }
    }

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
