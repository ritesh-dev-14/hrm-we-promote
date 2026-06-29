const Joi = require("joi");

const frequencyValues = [
  "weekly",
  "bi-weekly",
  "monthly",
  "quarterly",
  "yearly",
];

exports.createProjectSchema = Joi.object({
  projectName: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow("", null),
  departmentId: Joi.string().uuid().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  renewalDate: Joi.date(),
  frequency: Joi.string().valid(...frequencyValues),
  clientName: Joi.string().min(1).max(200),
  location: Joi.string().min(1).max(200),
  phone: Joi.string().min(1).max(50),
  fbEmail: Joi.string().email(),
  fbPassword: Joi.string().min(1).max(200),
  instaEmail: Joi.string().email(),
  instaPassword: Joi.string().min(1).max(200),
  projectStartDate: Joi.date(),
  assignTo: Joi.array().items(Joi.string().required()).min(1).required(),
}).unknown(false);

exports.updateProjectSchema = Joi.object({
  projectName: Joi.string().min(3).max(200),
  description: Joi.string().allow("", null),
  departmentId: Joi.string().uuid(),
  startDate: Joi.date(),
  endDate: Joi.date().when("startDate", {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref("startDate")),
  }),
  renewalDate: Joi.date().allow(null),
  frequency: Joi.string().valid(...frequencyValues).allow(null),
  clientName: Joi.string().min(1).max(200).allow(null),
  location: Joi.string().min(1).max(200).allow(null),
  phone: Joi.string().min(1).max(50).allow(null),
  fbEmail: Joi.string().email().allow(null),
  fbPassword: Joi.string().min(1).max(200).allow(null),
  instaEmail: Joi.string().email().allow(null),
  instaPassword: Joi.string().min(1).max(200).allow(null),
  projectStartDate: Joi.date().allow(null),
  assignTo: Joi.array().items(Joi.string().required()).min(1),
}).unknown(false);

exports.renewProjectSchema = Joi.object({
  renewalDate: Joi.date().required(),
}).unknown(false);
