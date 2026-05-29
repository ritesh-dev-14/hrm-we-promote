const service = require("./coordinator-assignment.service");

//
// 🔥 CREATE COORDINATOR ASSIGNMENT
//
exports.createAssignment = async (req, res, next) => {
  try {
    const result = await service.createAssignment(
      req.user,
      req.body
    );
    res.status(201).json({
      success: true,
      data: result,
      message: "Assignment created successfully"
    });
  } catch (error) {
    next(error);
  }
};

//
// 🔥 GET ASSIGNMENTS BY COORDINATOR
//
exports.getAssignmentsByCoordinator = async (req, res, next) => {
  try {
    const result =
      await service.getAssignmentsByCoordinator(
        req.user,
        req.query
      );
    res.json({
      success: true,
      data: result,
      message: "Assignments fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

//
// 🔥 GET ASSIGNMENTS ASSIGNED TO USER
//
exports.getAssignmentsByAssignedTo = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await service.getAssignmentsByAssignedTo(
        req.params.userId,
        req.query
      );
    res.json({
      success: true,
      data: result,
      message: "Assignments fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

//
// 🔥 GET SINGLE ASSIGNMENT
//
exports.getAssignmentById = async (req, res, next) => {
  try {
    const result = await service.getAssignmentById(
      req.user,
      req.params.assignmentId
    );
    res.json({
      success: true,
      data: result,
      message: "Assignment fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

//
// 🔥 UPDATE ASSIGNMENT STATUS
//
exports.updateAssignmentStatus = async (req, res, next) => {
  try {
    const result =
      await service.updateAssignmentStatus(
        req.user,
        req.params.assignmentId,
        req.body
      );
    res.json({
      success: true,
      data: result,
      message: "Assignment status updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

//
// 🔥 LIST ALL ASSIGNMENTS
//
exports.listAllAssignments = async (req, res, next) => {
  try {
    const result = await service.listAllAssignments(
      req.user,
      req.query
    );
    res.json({
      success: true,
      data: result,
      message: "Assignments fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};
