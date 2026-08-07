const Joi = require("joi");

exports.createUploadSchema = Joi.object({
  projectName: Joi.string().trim().required(),
  uploadDate: Joi.date().required(),
  clientName: Joi.string().trim().required(),
  totalUploads: Joi.number().integer().min(0).required(),
  items: Joi.array()
    .items(
      Joi.object({
        dataType: Joi.string().trim().required(),
        platform: Joi.string().trim().allow("", null),
      })
    )
    .default([]),
});

exports.updateUploadSchema = Joi.object({
  projectName: Joi.string().trim(),
  uploadDate: Joi.date(),
  clientName: Joi.string().trim(),
  totalUploads: Joi.number().integer().min(0),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().allow("", null),
        dataType: Joi.string().trim().required(),
        platform: Joi.string().trim().allow("", null),
      })
    ),
});
