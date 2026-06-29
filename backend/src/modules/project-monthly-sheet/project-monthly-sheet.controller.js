const service = require("./project-monthly-sheet.service");

exports.createProjectMonthlySheet = async (req, res, next) => {
  try {
    const data = await service.createProjectMonthlySheet(
      req.user,
      req.params.projectId,
      req.body
    );

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectMonthlySheets = async (req, res, next) => {
  try {
    const data = await service.getProjectMonthlySheets(
      req.user,
      req.params.projectId
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectMonthlySheetById = async (req, res, next) => {
  try {
    const data = await service.getProjectMonthlySheetById(
      req.user,
      req.params.projectId,
      req.params.sheetId
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProjectMonthlySheet = async (req, res, next) => {
  try {
    const data = await service.updateProjectMonthlySheet(
      req.user,
      req.params.projectId,
      req.params.sheetId,
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
