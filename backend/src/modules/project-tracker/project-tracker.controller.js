const service = require(
  "./project-tracker.service"
);

exports.getManagerTaskTracker =
  async (
    req,
    res,
    next
  ) => {
    try {

      const data =
        await service.getManagerTaskTracker(
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