const Joi = require("joi");

//
// 🔥 CREATE GROUP
//
exports.createGroupSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required(),
});

//
// 🔥 ADD MEMBERS
//
exports.addMembersSchema = Joi.object({
  employeeIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),
});