const Joi = require("joi");

exports.createShootWorkspaceSchema = Joi.object({
  brandName: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(500).allow("", null),
}).unknown(false);

exports.updateShootWorkspaceSchema = Joi.object({
  brandName: Joi.string().min(2).max(200),
  description: Joi.string().max(500).allow("", null),
}).unknown(false);

exports.addWorkspaceMembersSchema = Joi.object({
  employeeIds: Joi.array().items(Joi.string().required()).min(1).required(),
}).unknown(false);

exports.createShootTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).allow("", null),
  noOfPics: Joi.number().integer().min(0).required(),
  noOfReels: Joi.number().integer().min(0).required(),
  date: Joi.string().allow("", null),
  arrivalTime: Joi.string().allow("", null),
  location: Joi.string().max(1000).allow("", null),
  setupType: Joi.string().valid("PREMIUM", "VERY_PREMIUM", "PHONE").allow("", null),
}).unknown(false);

exports.updateShootTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().max(1000).allow("", null),
  noOfPics: Joi.number().integer().min(0),
  noOfReels: Joi.number().integer().min(0),
  date: Joi.string().allow("", null),
  arrivalTime: Joi.string().allow("", null),
  location: Joi.string().max(1000).allow("", null),
  setupType: Joi.string().valid("PREMIUM", "VERY_PREMIUM", "PHONE").allow("", null),
}).unknown(false);

exports.createShootSubTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).allow("", null),
  type: Joi.string().valid("PIC", "REEL").required(),
  referenceLinks: Joi.array().items(Joi.string().uri()).min(1).required(),
  videoType: Joi.string().valid("HORIZONTAL", "VERTICAL").required(),
  dayId: Joi.string().uuid().optional().allow("", null),
}).unknown(false);

exports.updateShootSubTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().max(1000).allow("", null),
  type: Joi.string().valid("PIC", "REEL"),
  referenceLinks: Joi.array().items(Joi.string().uri()).min(1),
  videoType: Joi.string().valid("HORIZONTAL", "VERTICAL"),
}).unknown(false);

exports.submitShootSubTaskSchema = Joi.object({
  submissionLinks: Joi.array().items(Joi.string().uri()).min(1),
  unableToSubmitReason: Joi.string().max(1000),
})
  .xor("submissionLinks", "unableToSubmitReason")
  .required()
  .unknown(false);

exports.reviewShootSubTaskSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  reviewReason: Joi.string().max(1000).when("status", {
    is: "REJECTED",
    then: Joi.required(),
    otherwise: Joi.optional().allow("", null),
  }),
}).unknown(false);

