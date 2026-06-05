module.exports = ({
  recipientName,
  coordinatorName,
  taskTitle,
  completionDate,
  assignedBy,
  recipientRole,
}) => {
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString()
    : "N/A";

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
          
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">📋 New Task Assignment</div>
            <div style="font-size: 14px; opacity: 0.9;">You've been assigned a new task</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #2196F3; font-weight: 600;">${recipientName}</span>,
            </p>

            <!-- Assignment Message -->
            <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                <span style="color: #2196F3; font-weight: 600;">${coordinatorName}</span> has assigned you a new task.
              </p>
            </div>

            <!-- Task Details -->
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; color: #888888; text-transform: uppercase; font-weight: 600; margin-bottom: 15px; letter-spacing: 0.5px;">Task Information</div>
              
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #2196F3; margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📌 Task</p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">${taskTitle}</p>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #1976D2;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">👤 Assigned By</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${assignedBy || coordinatorName}</p>
                </div>
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #1976D2;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Role</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${recipientRole || "N/A"}</p>
                </div>
              </div>
            </div>

            <!-- Deadline -->
            <div style="background-color: #fff3e0; border-left: 4px solid #FF9800; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #E65100; font-size: 14px; font-weight: 500;">
                <span style="font-weight: 700;">📅 Completion Date:</span> ${formattedDate}
              </p>
            </div>

          </div>

          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">
              Best regards,
            </p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
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