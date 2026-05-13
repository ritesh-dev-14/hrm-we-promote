const service = require(
  "./task-item-submission.service"
);

// 🔥 GET MY ITEMS
exports.getMyAssignedItems =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.getMyAssignedItems(
          req.user
        );

      res.json({
        success: true,
        data,
      });

    } catch (err) {
      next(err);
    }
  };

// 🔥 SUBMIT ITEM
exports.submitTaskItem =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.submitTaskItem(
          req.user,
          req.params.assignmentId,
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

// 🔥 VERIFY SUBMISSION
exports.verifySubmission =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.verifySubmission(
          req.user,
          req.params.assignmentId
        );

      res.json({
        success: true,
        data,
      });

    } catch (err) {
      next(err);
    }
  };



  exports.rejectSubmission =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.rejectSubmission(
          req.user,
          req.params.assignmentId,
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

  //
// 🔥 UPDATE ITEM PROGRESS
//
exports.updateItemProgress =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.updateItemProgress(
          req.user,
          req.params.assignmentId,
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