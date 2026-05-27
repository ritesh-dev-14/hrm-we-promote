// const service = require("./task.service");

// //
// // 🔥 CREATE TASK
// //
// exports.createTask = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await service.createTask(
//         req.user,
//         req.body
//       );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //
// // 🔥 ASSIGN TASK
// //
// exports.assignTask = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await service.assignTask(
//         req.user,
//         req.params.id,
//         req.body
//       );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //
// // 🔥 GET ALL TASKS
// //
// exports.getTasks = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await service.getTasks(req.user);

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //
// // 🔥 GET SINGLE TASK
// //
// exports.getTaskById = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await service.getTaskById(
//         req.user,
//         req.params.id
//       );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //
// // 🔥 GET MY ASSIGNED TASKS
// //
// exports.getMyAssignedTasks = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await service.getMyAssignedTasks(
//         req.user
//       );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //
// // 🔥 UPDATE TASK ASSIGNMENT STATUS
// //
// exports.updateTaskAssignmentStatus = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await service.updateTaskAssignmentStatus(
//         req.user,
//         req.params.assignmentId,
//         req.body
//       );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };







const service = require("./task.service");

//
// 🔥 CREATE TASK
//
exports.createTask = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.createTask(
        req.user,
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
// 🔥 ASSIGN TASK
//
exports.assignTask = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.assignTask(
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

//
// 🔥 GET TASKS
//
exports.getTasks = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.getTasks(
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

//
// 🔥 GET TASK BY ID
//
exports.getTaskById = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.getTaskById(
        req.user,
        req.params.id
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
// 🔥 GET MY TASKS
//
exports.getMyAssignedTasks =
  async (
    req,
    res,
    next
  ) => {
    try {
      const data =
        await service.getMyAssignedTasks(
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

//
// 🔥 UPDATE TASK STATUS
//
exports.updateTaskAssignmentStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const data =
        await service.updateTaskAssignmentStatus(
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
// 🔥 GET TASK ITEMS WITH ALL DETAILS
//
exports.getTaskItemsWithDetails =
  async (
    req,
    res,
    next
  ) => {
    try {
      const data =
        await service.getTaskItemsWithDetails(
          req.user,
          req.params.taskId
        );

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };