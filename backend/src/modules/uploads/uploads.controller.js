const service = require("./uploads.service");

exports.createUpload = async (req, res, next) => {
  try {
    const data = await service.createUpload(req.user, req.body);
    res.status(201).json({
      success: true,
      message: "Upload entry created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUploads = async (req, res, next) => {
  try {
    const data = await service.getAllUploads(req.user, req.query);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUploadById = async (req, res, next) => {
  try {
    const data = await service.getUploadById(req.user, req.params.id);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUpload = async (req, res, next) => {
  try {
    const data = await service.updateUpload(req.user, req.params.id, req.body);
    res.json({
      success: true,
      message: "Upload entry updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUpload = async (req, res, next) => {
  try {
    const data = await service.deleteUpload(req.user, req.params.id);
    res.json({
      success: true,
      message: "Upload entry deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
