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
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow("", null).optional(),
  type: Joi.string().valid("PIC", "REEL").required(),
  referenceLinks: Joi.array().items(Joi.string().allow("")).default([]).optional(),
  videoType: Joi.string().valid("HORIZONTAL", "VERTICAL").allow("", null).optional(),
  setupType: Joi.string().valid("PREMIUM", "VERY_PREMIUM", "PHONE").allow("", null).optional(),
  dayId: Joi.string().allow("", null).optional(),
}).unknown(true);

exports.updateShootSubTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).allow("", null).optional(),
  type: Joi.string().valid("PIC", "REEL").optional(),
  referenceLinks: Joi.array().items(Joi.string().allow("")).default([]).optional(),
  videoType: Joi.string().valid("HORIZONTAL", "VERTICAL").allow("", null).optional(),
  setupType: Joi.string().valid("PREMIUM", "VERY_PREMIUM", "PHONE").allow("", null).optional(),
  dayId: Joi.string().allow("", null).optional(),
}).unknown(true);

exports.submitShootSubTaskSchema = Joi.object({
  submissionLinks: Joi.array().items(Joi.string().allow("")).optional(),
  unableToSubmitReason: Joi.string().max(1000).allow("", null).optional(),
})
  .unknown(true);

exports.reviewShootSubTaskSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  reviewReason: Joi.string().max(1000).when("status", {
    is: "REJECTED",
    then: Joi.required(),
    otherwise: Joi.optional().allow("", null),
  }),
}).unknown(false);

