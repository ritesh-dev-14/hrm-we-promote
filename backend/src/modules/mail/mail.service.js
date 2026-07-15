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

const coordinatorFollowUpTemplate = require(
  "./templates/coordinatorFollowUp.template"
);

const employeeReplyTemplate = require(
  "./templates/employeeReply.template"
);

const coordinatorAssignmentTemplate = require(
  "./templates/coordinatorAssignment.template"
);

const projectAssignedToManagerTemplate = require(
  "./templates/projectAssignedToManager.template"
);

const taskItemAssignedToEmployeeTemplate = require(
  "./templates/taskItemAssignedToEmployee.template"
);

const shootTaskAssignedToEmployeeTemplate = require(
  "./templates/shootTaskAssignedToEmployee.template"
);

const mailEnabled = process.env.MAIL_ENABLED !== "false";

const brevoApiKey = process.env.BREVO_API_KEY;

const mailRuntimeState = {
  disabled: false,
  reason: null,
  warned: false,
};

const hasSmtpConfig =
  Boolean(process.env.BREVO_SMTP_USER) &&
  Boolean(process.env.BREVO_SMTP_KEY) &&
  Boolean(process.env.MAIL_FROM);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.BREVO_SMTP_PORT || 587),
      secure: Number(process.env.BREVO_SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    })
  : null;

const parseMailFrom = (value) => {
  if (!value) {
    return { email: null, name: null };
  }

  const match = value.match(/^(.*)<([^>]+)>$/);

  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, "") || null,
      email: match[2].trim(),
    };
  }

  return {
    name: null,
    email: value.trim(),
  };
};

const isBrevoAuthOrIpError = (status, body) => {
  const text = String(body || "").toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    text.includes("unrecognised ip address") ||
    text.includes("unauthorized") ||
    text.includes("key not found")
  );
};

const disableMailForRuntime = (reason) => {
  mailRuntimeState.disabled = true;
  mailRuntimeState.reason = reason;

  if (!mailRuntimeState.warned) {
    console.warn(`Mail disabled for this runtime: ${reason}`);
    mailRuntimeState.warned = true;
  }
};

const sendViaBrevoApi = async ({
  to,
  subject,
  html,
}) => {
  const sender = parseMailFrom(process.env.MAIL_FROM);

  if (!sender.email) {
    throw new Error("MAIL_FROM is required for Brevo email sending.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      replyTo: { email: sender.email, name: sender.name || "WePromote HRM" },
      subject,
      htmlContent: html,
      headers: {
        "X-Mailer": "WePromote HRM Notification System",
        "X-Entity-Ref-ID": `wepromote-${Date.now()}`,
      },
      tags: ["hrm-notification"],
    }),
  });


  if (!response.ok) {
    const errorBody = await response.text();
    if (isBrevoAuthOrIpError(response.status, errorBody)) {
      disableMailForRuntime(
        `Brevo rejected this runtime (${response.status}): ${errorBody}`
      );

      return { disabled: true, reason: mailRuntimeState.reason };
    }

    throw new Error(
      `Brevo API error ${response.status}: ${errorBody}`
    );
  }

  return { disabled: false };
};

const checkMailStartup = async () => {
  if (!mailEnabled) {
    return {
      enabled: false,
      status: "skipped",
      message: "Mail is disabled via MAIL_ENABLED=false",
    };
  }

  if (mailRuntimeState.disabled) {
    return {
      enabled: false,
      status: "disabled",
      message: mailRuntimeState.reason,
    };
  }

  if (brevoApiKey) {
    const sender = parseMailFrom(process.env.MAIL_FROM);

    const response = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: {
        "api-key": brevoApiKey,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (isBrevoAuthOrIpError(response.status, errorBody)) {
        disableMailForRuntime(
          `Brevo rejected this runtime (${response.status}): ${errorBody}`
        );

        return {
          enabled: false,
          status: "disabled",
          message: mailRuntimeState.reason,
        };
      }

      throw new Error(`Brevo API startup check failed ${response.status}: ${errorBody}`);
    }

    return {
      enabled: true,
      status: "ok",
      mode: "brevo-api",
      sender: sender.email,
    };
  }

  if (transporter) {
    await transporter.verify();

    return {
      enabled: true,
      status: "ok",
      mode: "smtp",
    };
  }

  throw new Error(
    "Mail is not configured. Set BREVO_API_KEY and MAIL_FROM, or BREVO_SMTP_USER, BREVO_SMTP_KEY, and MAIL_FROM."
  );
};

//
// 🔥 COMMON SEND MAIL
//
const sendMail = async ({
  to,
  subject,
  html,
}) => {
  if (!mailEnabled) {
    console.warn(`Mail disabled, skipping email to ${to}: ${subject}`);
    return;
  }

  if (mailRuntimeState.disabled) {
    if (!mailRuntimeState.warned) {
      console.warn(`Mail disabled, skipping email to ${to}: ${subject}`);
      mailRuntimeState.warned = true;
    }

    return;
  }

  if (brevoApiKey) {
    await sendViaBrevoApi({
      to,
      subject,
      html,
    });
    return;
  }

  if (!transporter) {
    throw new Error("Mail is not configured. Set BREVO_API_KEY and MAIL_FROM, or BREVO_SMTP_USER, BREVO_SMTP_KEY, and MAIL_FROM.");
  }

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

//
// 🔥 COORDINATOR → EMPLOYEE FOLLOW-UP
//
exports.sendCoordinatorFollowUpMail =
  async ({
    email,
    employeeName,
    coordinatorName,
    taskTitle,
    message,
  }) => {

    const html =
      coordinatorFollowUpTemplate({
        employeeName,
        coordinatorName,
        taskTitle,
        message,
      });

    await sendMail({
      to: email,
      subject: "You got a text from coordinator",
      html,
    });
  };

//
// 🔥 EMPLOYEE → COORDINATOR REPLY
//
exports.sendEmployeeReplyMail =
  async ({
    email,
    coordinatorName,
    employeeName,
    taskTitle,
    message,
  }) => {

    const html =
      employeeReplyTemplate({
        coordinatorName,
        employeeName,
        taskTitle,
        message,
      });

    await sendMail({
      to: email,
      subject: "You got a text from employee",
      html,
    });
  };

//
// 🔥 COORDINATOR → ASSIGNED USER TASK EMAIL
//
exports.sendCoordinatorAssignmentMail =
  async ({
    email,
    recipientName,
    coordinatorName,
    taskTitle,
    completionDate,
    assignedBy,
    recipientRole,
  }) => {

    const html =
      coordinatorAssignmentTemplate({
        recipientName,
        coordinatorName,
        taskTitle,
        completionDate,
        assignedBy,
        recipientRole,
      });

    await sendMail({
      to: email,
      subject: "You got task from coordinator",
      html,
    });
  };

//
// 🔥 HR → MANAGER (PROJECT ASSIGNED)
//
exports.sendProjectAssignedToManagerMail =
  async ({
    email,
    managerName,
    projectName,
    departmentName,
    startDate,
    endDate,
    hrName,
    description,
  }) => {

    const html =
      projectAssignedToManagerTemplate({
        managerName,
        projectName,
        departmentName,
        startDate,
        endDate,
        hrName,
        description,
      });

    await sendMail({
      to: email,
      subject: `New Project Assigned: ${projectName}`,
      html,
    });
  };

//
// 🔥 MANAGER → EMPLOYEE (TASK ITEM ASSIGNED)
//
exports.sendTaskItemAssignedToEmployeeMail =
  async ({
    email,
    employeeName,
    managerName,
    taskTitle,
    projectName,
    dueDate,
    priority,
    description,
    referenceLink,
  }) => {

    const html =
      taskItemAssignedToEmployeeTemplate({
        employeeName,
        managerName,
        taskTitle,
        projectName,
        dueDate,
        priority,
        description,
        referenceLink,
      });

    await sendMail({
      to: email,
      subject: `New Task Assigned: ${taskTitle}`,
      html,
    });
  };

//
// 🔥 MANAGER → EMPLOYEE (SHOOT TASK ASSIGNED)
//
exports.sendShootTaskAssignedToEmployeeMail =
  async ({
    email,
    employeeName,
    managerName,
    workspaceName,
    taskTitle,
    taskDate,
    taskLocation,
    description,
  }) => {

    const html =
      shootTaskAssignedToEmployeeTemplate({
        employeeName,
        managerName,
        workspaceName,
        taskTitle,
        taskDate,
        taskLocation,
        description,
      });

    await sendMail({
      to: email,
      subject: `Shoot Task Assigned: ${taskTitle || workspaceName}`,
      html,
    });
  };

//
// 🔥 EXPORT SEND MAIL FOR GENERAL USE
//
exports.sendMail = sendMail;
exports.checkMailStartup = checkMailStartup;