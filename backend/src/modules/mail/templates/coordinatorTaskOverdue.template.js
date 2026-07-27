module.exports = ({
  coordinatorName,
  employeeName,
  employeeId,
  taskTitle,
  completionDate,
}) => {
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
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
          <div style="background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 36px; margin-bottom: 10px;">⚠️</div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Completion Target Missed</div>
            <div style="font-size: 14px; opacity: 0.9;">An employee has not completed their assigned task on time</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 24px; line-height: 1.6;">
              Hi <span style="color: #e53935; font-weight: 600;">${coordinatorName}</span>,
            </p>

            <!-- Alert Message -->
            <div style="background-color: #ffebee; border-left: 4px solid #e53935; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                This is an automated alert to inform you that
                <span style="color: #e53935; font-weight: 700;">${employeeName}</span>
                has <strong>not completed</strong> the assigned task by the set deadline.
              </p>
            </div>

            <!-- Task & Employee Details -->
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; color: #888888; text-transform: uppercase; font-weight: 600; margin-bottom: 15px; letter-spacing: 0.5px;">Details</div>
              
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #e53935; margin-bottom: 12px;">
                <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📋 Task</p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">${taskTitle}</p>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #b71c1c;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">👤 Employee</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${employeeName}</p>
                  <p style="margin: 4px 0 0 0; color: #888888; font-size: 12px;">${employeeId || ""}</p>
                </div>
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #b71c1c;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Deadline Was</p>
                  <p style="margin: 0; color: #e53935; font-size: 14px; font-weight: 700;">${formattedDate}</p>
                </div>
              </div>
            </div>

            <!-- Action Prompt -->
            <div style="background-color: #fff8e1; border-left: 4px solid #FFA000; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #5d4037; font-size: 14px; line-height: 1.6;">
                💡 Please follow up with <strong>${employeeName}</strong> or take appropriate action via the Priority Actions dashboard.
              </p>
            </div>

          </div>

          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">
              Best regards,
            </p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
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
