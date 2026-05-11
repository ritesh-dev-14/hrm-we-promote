const service = require("./task-group.service");

//
// 🔥 CREATE GROUP
//
exports.createGroup = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.createGroup(
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
// 🔥 ADD MEMBERS
//
exports.addMembers = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.addMembers(
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
// 🔥 GET GROUPS
//
exports.getGroups = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.getGroups(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

//
// 🔥 GET SINGLE GROUP
//
exports.getGroupById = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await service.getGroupById(
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