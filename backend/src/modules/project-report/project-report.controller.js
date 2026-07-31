const projectReportService = require("./project-report.service");

exports.createReport = async (req, res, next) => {
  try {
    const report = await projectReportService.createReport(req.user, req.body);
    res.status(201).json({
      status: "success",
      message: "Daily report submitted successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectReports = async (req, res, next) => {
  try {
    const reports = await projectReportService.getProjectReports(req.user, req.params.projectId);
    res.status(200).json({
      status: "success",
      message: "Reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableProjects = async (req, res, next) => {
  try {
    const projects = await projectReportService.getAvailableProjects(req.user);
    res.status(200).json({
      status: "success",
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};
