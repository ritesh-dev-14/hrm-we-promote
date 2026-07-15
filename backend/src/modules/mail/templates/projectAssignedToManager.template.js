module.exports = ({
  managerName,
  projectName,
  departmentName,
  startDate,
  endDate,
  hrName,
  description,
}) => {
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
          <div style="background: linear-gradient(135deg, #6C3FC5 0%, #4A2899 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">🚀 New Project Assigned</div>
            <div style="font-size: 14px; opacity: 0.9;">A project has been assigned to you by HR</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">

            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #6C3FC5; font-weight: 600;">${managerName}</span>,
            </p>

            <!-- Assignment Message -->
            <div style="background-color: #f0ebff; border-left: 4px solid #6C3FC5; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                You have been assigned a new project by <strong>${hrName || "HR"}</strong>. Please review the project details below and begin planning accordingly.
              </p>
            </div>

            <!-- Project Details -->
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; color: #888888; text-transform: uppercase; font-weight: 600; margin-bottom: 15px; letter-spacing: 0.5px;">Project Details</div>

              <!-- Project Name -->
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #6C3FC5; margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📁 Project Name</p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">${projectName}</p>
              </div>

              <!-- Department -->
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #4A2899; margin-bottom: 12px;">
                <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🏢 Department</p>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${departmentName || "N/A"}</p>
              </div>

              <!-- Dates Row -->
              <div style="display: flex; gap: 12px;">
                <div style="flex: 1; padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #6C3FC5;">
                  <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Start Date</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${startDate || "N/A"}</p>
                </div>
                <div style="flex: 1; padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #4A2899;">
                  <p style="margin: 0 0 6px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🏁 End Date</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 500;">${endDate || "N/A"}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            ${description ? `
            <div style="background-color: #ffffff; border: 2px solid #6C3FC5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">📋 Project Description</p>
              <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                ${description}
              </p>
            </div>
            ` : ""}

            <!-- Action Note -->
            <div style="background-color: #fff8e1; border-left: 4px solid #FFC107; padding: 15px 20px; border-radius: 5px;">
              <p style="margin: 0; color: #7a6000; font-size: 14px; line-height: 1.6;">
                ⚡ <strong>Action Required:</strong> Please log in to the WePromote HRM portal to view full project details and begin managing your tasks.
              </p>
            </div>

          </div>

          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">
              Best regards,
            </p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #6C3FC5 0%, #4A2899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
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
