const Joi = require("joi");

const mediaSourceValues = ["SHOOT", "AI"];

const monthlySheetDaySchema = Joi.object({
  date: Joi.date().required(),
  reelType: Joi.string().valid(...mediaSourceValues).required(),
  postType: Joi.string().valid(...mediaSourceValues).required(),
  script: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
});

exports.createProjectMonthlySheetSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
  totalReels: Joi.number().integer().min(0).required(),
  totalPosts: Joi.number().integer().min(0).required(),
  totalReelsUploaded: Joi.number().integer().min(0).required(),
  totalPostsUploaded: Joi.number().integer().min(0).required(),
  moodBoardLink: Joi.string().uri().required(),
  days: Joi.array().items(monthlySheetDaySchema).min(1).required(),
}).unknown(false);

exports.updateProjectMonthlySheetSchema = Joi.object({
  totalReels: Joi.number().integer().min(0),
  totalPosts: Joi.number().integer().min(0),
  totalReelsUploaded: Joi.number().integer().min(0),
  totalPostsUploaded: Joi.number().integer().min(0),
  moodBoardLink: Joi.string().uri(),
  days: Joi.array().items(monthlySheetDaySchema).min(1),
}).unknown(false);
