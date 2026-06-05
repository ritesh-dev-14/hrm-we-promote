module.exports = ({
  hrName,
  managerName,
  employeeName,
  date,
  escalationLevel = "HR",
  applicationUrl = "http://localhost:5173",
}) => {
  const escalationMessages = {
    HR: "A manager has not assigned tasks to their employee. This matter requires HR attention.",
    ADMIN: "A manager has not assigned tasks even after HR notification. This requires immediate administrative action.",
    FINAL: "This is the final escalation. Tasks still have not been assigned.",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Assignment Escalation - ${escalationLevel}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); overflow: hidden;">
          
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">⚠️ ESCALATION ALERT</div>
            <div style="font-size: 14px; opacity: 0.95;">Task Assignment Issue Escalation - Level: <span style="font-weight: 700;">${escalationLevel}</span></div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #D32F2F; font-weight: 600;">${hrName}</span>,
            </p>

            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-left: 5px solid #D32F2F; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0; color: #B71C1C; font-size: 15px; line-height: 1.6; font-weight: 500;">
                🚨 ${escalationMessages[escalationLevel]}
              </p>
            </div>

            <!-- Escalation Details -->
            <div style="background-color: #fafafa; padding: 25px; border-radius: 8px; border: 2px solid #D32F2F; margin-bottom: 30px;">
              <div style="font-size: 12px; color: #D32F2F; text-transform: uppercase; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px;">Escalation Details</div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #D32F2F;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Manager</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">${managerName}</p>
                </div>
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #D32F2F;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Employee</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">${employeeName}</p>
                </div>
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #D32F2F;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Date Affected</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">${date}</p>
                </div>
                <div style="padding: 12px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #D32F2F;">
                  <p style="margin: 0 0 5px 0; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Issue</p>
                  <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">No Tasks Assigned</p>
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background-color: #fff3e0; border-left: 4px solid #FF9800; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0; color: #E65100; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">📝 Action Required</p>
              <ul style="margin: 0; padding-left: 20px; color: #E65100; font-size: 14px;">
                <li style="margin-bottom: 8px;">Review manager's task assignment activity</li>
                <li style="margin-bottom: 8px;">Contact the manager for explanation</li>
                <li>Ensure tasks are assigned for the specified date</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${applicationUrl}" style="display: inline-block; background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 14px;">
                📂 View in System
              </a>
            </div>

          </div>

          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 2px solid #ffebee; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 13px; font-weight: 500;">
              This is an automated escalation notification
            </p>
            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
              <strong>Escalation Level:</strong> ${escalationLevel}
            </p>
            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
              Please do not reply to this email. Contact your HR department if you have questions.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};
