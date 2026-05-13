// const Joi = require("joi");

// //
// // 🔥 CREATE TASK VALIDATION
// //
// exports.createTaskSchema = Joi.object({
//   title: Joi.string()
//     .min(3)
//     .max(100)
//     .required(),

//   description: Joi.string().allow(
//     "",
//     null
//   ),

//   instructions: Joi.string().allow(
//     "",
//     null
//   ),

//   referenceLink: Joi.string().allow(
//     "",
//     null
//   ),

//   date: Joi.date().required(),

//   location: Joi.string().allow(
//     "",
//     null
//   ),

//   setupType: Joi.string()
//     .valid(
//       "PREMIUM",
//       "VERY_PREMIUM",
//       "PHONE"
//     )
//     .required(),

//   // assignedToRole: Joi.string()
//   //   .valid("MANAGER", "EMPLOYEE")
//   //   .required(),

//   isGroupTask: Joi.boolean().optional(),
// });

// //
// // 🔥 ASSIGN TASK VALIDATION
// //
// exports.assignTaskSchema = Joi.object({
//   assignments: Joi.array()
//   .items(
//     Joi.object({
//       employeeId:
//         Joi.string().required(),

//       taskGroupId: Joi.string().allow(
//         "",
//         null
//       ),
//     })
//   )
//     .min(1)
//     .required(),
// });

// //
// // 🔥 UPDATE TASK STATUS VALIDATION
// //
// exports.updateTaskStatusSchema =
//   Joi.object({
//     status: Joi.string()
//       .valid(
//         "IN_PROGRESS",
//         "SUBMITTED",
//         "VERIFIED",
//         "REJECTED",
//         "COMPLETED"
//       )
//       .required(),

//     progress: Joi.number()
//       .min(0)
//       .max(100)
//       .optional(),

//     rejectionReason: Joi.string().allow(
//       "",
//       null
//     ),
//   });






const Joi = require("joi");

//
// 🔥 CREATE TASK VALIDATION
//
exports.createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string().allow(
    "",
    null
  ),

  instructions: Joi.string().allow(
    "",
    null
  ),

  referenceLink: Joi.string().allow(
    "",
    null
  ),

  date: Joi.date().required(),

  location: Joi.string().allow(
    "",
    null
  ),

  setupType: Joi.string()
    .valid(
      "PREMIUM",
      "VERY_PREMIUM",
      "PHONE"
    )
    .required(),

  isGroupTask: Joi.boolean().optional(),
});

//
// 🔥 ASSIGN TASK VALIDATION
//
exports.assignTaskSchema = Joi.object({
  assignments: Joi.array()
    .items(
      Joi.object({
        employeeId:
          Joi.string().required(),

        taskGroupId:
          Joi.string().allow(
            "",
            null
          ),
      })
    )
    .min(1)
    .required(),
});

//
// 🔥 UPDATE TASK STATUS
//
exports.updateTaskStatusSchema =
  Joi.object({
    status: Joi.string()
      .valid(
        "PENDING",
        "IN_PROGRESS",
        "SUBMITTED",
        "VERIFIED",
        "COMPLETED",
        "REJECTED"
      )
      .required(),

    progress: Joi.number()
      .min(0)
      .max(100)
      .optional(),

    rejectionReason:
      Joi.string().allow(
        "",
        null
      ),
  });