const service = require("./payslip.service");

exports.getUsersForPayslip = async (req, res, next) => {
  try {
    const data = await service.getUsersForPayslip();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadPayslip = async (req, res, next) => {
  try {
    const data = await service.uploadPayslip({
      user: req.user,
      file: req.file,
      body: req.body || {},
    });

    res.status(201).json({
      success: true,
      message: "Payslip uploaded successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllPayslips = async (req, res, next) => {
  try {
    const data = await service.getAllPayslips(req.query);

    res.json({
      success: true,
      data: data.payslips,
      pagination: data.pagination,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyPayslips = async (req, res, next) => {
  try {
    const data = await service.getMyPayslips(req.user, req.query);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayslipById = async (req, res, next) => {
  try {
    const data = await service.getPayslipById(req.params.id, req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePayslip = async (req, res, next) => {
  try {
    const data = await service.updatePayslip({
      id: req.params.id,
      user: req.user,
      file: req.file,
      body: req.body || {},
    });

    res.json({
      success: true,
      message: "Payslip updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePayslip = async (req, res, next) => {
  try {
    const data = await service.deletePayslip(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
