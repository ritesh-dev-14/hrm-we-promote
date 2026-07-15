module.exports = ({
  employeeName,
  managerName,
  taskTitle,
  projectName,
  dueDate,
  priority,
  description,
  referenceLink,
}) => {
  const priorityColor =
    priority === "HIGH"   ? "#E53935" :
    priority === "MEDIUM" ? "#FB8C00" :
                            "#43A047";

  const priorityBg =
    priority === "HIGH"   ? "#FFEBEE" :
    priority === "MEDIUM" ? "#FFF3E0" :
                            "#E8F5E9";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">📋 New Task Assigned</div>
            <div style="font-size: 14px; opacity: 0.9;">Your manager has assigned a task to you</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">

            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #1E88E5; font-weight: 600;">${employeeName}</span>,
            </p>

            <!-- Notice -->
            <div style="background-color: #E3F2FD; border-left: 4px solid #1E88E5; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                <strong>${managerName || "Your Manager"}</strong> has assigned a task to you. Please review the details below and begin work as soon as possible.
              </p>
            </div>

            <!-- Task Details -->
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; color: #888888; text-transform: uppercase; font-weight: 600; margin-bottom: 15px; letter-spacing: 0.5px;">Task Details</div>

              <!-- Task Title -->
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #1E88E5; margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📌 Task Title</p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">${taskTitle}</p>
              </div>

              <!-- Project -->
              ${projectName ? `
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #1565C0; margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📁 Project</p>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${projectName}</p>
              </div>
              ` : ""}

              <!-- Due Date & Priority -->
              <div style="display: flex; gap: 12px;">
                ${dueDate ? `
                <div style="flex: 1; padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #1E88E5;">
                  <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Due Date</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${dueDate}</p>
                </div>
                ` : ""}
                ${priority ? `
                <div style="flex: 1; padding: 15px; background-color: ${priorityBg}; border-radius: 5px; border-left: 3px solid ${priorityColor};">
                  <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Priority</p>
                  <p style="margin: 0; color: ${priorityColor}; font-size: 14px; font-weight: 700;">${priority}</p>
                </div>
                ` : ""}
              </div>
            </div>

            <!-- Description -->
            ${description ? `
            <div style="background-color: #ffffff; border: 2px solid #1E88E5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">📋 Description</p>
              <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                ${description}
              </p>
            </div>
            ` : ""}

            <!-- Reference Link -->
            ${referenceLink ? `
            <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">🔗 Reference Link</p>
              <a href="${referenceLink}" style="color: #1E88E5; font-size: 14px; word-break: break-all;">${referenceLink}</a>
            </div>
            ` : ""}

            <!-- Action Note -->
            <div style="background-color: #FFF8E1; border-left: 4px solid #FFC107; padding: 15px 20px; border-radius: 5px;">
              <p style="margin: 0; color: #7a6000; font-size: 14px; line-height: 1.6;">
                ⚡ <strong>Action Required:</strong> Please log in to the WePromote HRM portal to view full task details and start working.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">Best regards,</p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
                WePromote
              </span>
            </div>
            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};
