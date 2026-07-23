// const service = require("./task-item.service");

// exports.createTaskItem = async (
//   req,
//   res,
//   next
// ) => {
//   try {

//     const data =
//       await service.createTaskItem(
//         req.user,
//         req.params.taskId,
//         req.body
//       );

//     res.json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// exports.assignTaskItem = async (
//   req,
//   res,
//   next
// ) => {

//   try {

//     const data =
//       await service.assignTaskItem(
//         req.user,
//         req.params.taskItemId,
//         req.body
//       );

//     res.json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// exports.getMyTaskItems = async (
//   req,
//   res,
//   next
// ) => {

//   try {

//     const data =
//       await service.getMyTaskItems(
//         req.user
//       );

//     res.json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     next(err);
//   }
// };



const service = require("./task-item.service");


// 🔥 CREATE ITEM
exports.createTaskItem = async (
  req,
  res,
  next
) => {
  try {

    const data =
      await service.createTaskItem(
        req.user,
        req.params.taskId,
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


// 🔥 GET ITEMS
exports.getTaskItems = async (
  req,
  res,
  next
) => {
  try {

    const data =
      await service.getTaskItems(
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


// 🔥 ASSIGN ITEM
exports.assignTaskItem = async (
  req,
  res,
  next
) => {
  try {

    const data =
      await service.assignTaskItem(
        req.user,
        req.params.itemId,
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


// 🔥 UPDATE ITEM STATUS
exports.updateTaskItemStatus = async (
  req,
  res,
  next
) => {
  try {

    const data =
      await service.updateTaskItemStatus(
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
// 🔥 UPDATE TASK ITEM
//
exports.updateTaskItem = async (req, res, next) => {
  try {
    const data = await service.updateTaskItem(req.params.itemId, req.body);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

//
// 🔥 DELETE TASK ITEM
//
exports.deleteTaskItem = async (req, res, next) => {
  try {
    const data = await service.deleteTaskItem(req.params.itemId);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};