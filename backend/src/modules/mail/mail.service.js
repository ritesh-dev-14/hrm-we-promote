const nodemailer = require("nodemailer");

const managerTaskAssignedTemplate = require(
  "./templates/managerTaskAssigned.template"
);

const employeeTaskAssignedTemplate = require(
  "./templates/employeeTaskAssigned.template"
);

const submissionTemplate = require(
  "./templates/submission.template"
);

const approvalTemplate = require(
  "./templates/approval.template"
);

const rejectionTemplate = require(
  "./templates/rejection.template"
);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,

  port: process.env.MAIL_PORT,

  secure: false,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

//
// 🔥 COMMON SEND MAIL
//
const sendMail = async ({
  to,
  subject,
  html,
}) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

//
// 🔥 HR → MANAGER
//
exports.sendTaskAssignedToManagerMail =
  async ({
    email,
    managerName,
    taskTitle,
    date,
    instructions,
  }) => {

    const html =
      managerTaskAssignedTemplate({
        managerName,
        taskTitle,
        date,
        instructions,
      });

    await sendMail({
      to: email,
      subject: "New Task Assigned",
      html,
    });
  };

//
// 🔥 MANAGER → EMPLOYEE
//
exports.sendTaskAssignedToEmployeeMail =
  async ({
    email,
    employeeName,
    taskTitle,
    itemTitle,
    instructions,
  }) => {

    const html =
      employeeTaskAssignedTemplate({
        employeeName,
        taskTitle,
        itemTitle,
        instructions,
      });

    await sendMail({
      to: email,
      subject: "Task Item Assigned",
      html,
    });
  };

//
// 🔥 EMPLOYEE → MANAGER
//
exports.sendSubmissionMailToManager =
  async ({
    email,
    managerName,
    employeeName,
    taskTitle,
    remarks,
    driveLink,
  }) => {

    const html =
      submissionTemplate({
        managerName,
        employeeName,
        taskTitle,
        remarks,
        driveLink,
      });

    await sendMail({
      to: email,
      subject: "Task Submitted",
      html,
    });
  };

//
// 🔥 APPROVED
//
exports.sendApprovalMailToEmployee =
  async ({
    email,
    employeeName,
    taskTitle,
  }) => {

    const html =
      approvalTemplate({
        employeeName,
        taskTitle,
      });

    await sendMail({
      to: email,
      subject: "Task Approved",
      html,
    });
  };

//
// 🔥 REJECTED
//
exports.sendRejectionMailToEmployee =
  async ({
    email,
    employeeName,
    taskTitle,
    reason,
  }) => {

    const html =
      rejectionTemplate({
        employeeName,
        taskTitle,
        reason,
      });

    await sendMail({
      to: email,
      subject: "Task Rejected",
      html,
    });
  };