module.exports = ({
  managerName,
  employeeName,
  reminderCount,
  date,
  applicationUrl = "http://localhost:5173",
}) => {
  const reminderText = {
    1: "First reminder",
    2: "Second reminder",
    3: "Third reminder",
  };

  const urgencyMessage = {
    1: "Please assign tasks as soon as possible.",
    2: "This is your second reminder. Please assign tasks immediately.",
    3: "URGENT: This is your final reminder before escalation to HR.",
  };

  const headerColors = {
    1: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
    2: "linear-gradient(135deg, #FB8C00 0%, #E65100 100%)",
    3: "linear-gradient(135deg, #F4511E 0%, #D84315 100%)",
  };

  const borderColor = {
    1: "#FF9800",
    2: "#FB8C00",
    3: "#F4511E",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Assignment Reminder</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); overflow: hidden;">
          
          <!-- Header Section -->
          <div style="background: ${headerColors[reminderCount]}; padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">${reminderCount === 3 ? '🚨' : reminderCount === 2 ? '⏰' : '📢'} ${reminderText[reminderCount].toUpperCase()}</div>
            <div style="font-size: 14px; opacity: 0.95;">Task Assignment Reminder</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: ${borderColor[reminderCount]}; font-weight: 600;">${managerName}</span>,
            </p>

            <!-- Urgency Alert -->
            <div style="background-color: ${reminderCount === 3 ? '#ffebee' : reminderCount === 2 ? '#fff3e0' : '#fff8e1'}; border-left: 5px solid ${borderColor[reminderCount]}; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0; color: ${reminderCount === 3 ? '#D32F2F' : reminderCount === 2 ? '#E65100' : '#F57F17'}; font-size: 15px; line-height: 1.6; font-weight: 500;">
                <strong>${urgencyMessage[reminderCount]}</strong>
              </p>
            </div>

            <!-- Task Details -->
            <div style="background-color: #fafafa; padding: 25px; border-radius: 8px; border: 2px solid ${borderColor[reminderCount]}; margin-bottom: 30px;">
              <div style="font-size: 12px; color: ${borderColor[reminderCount]}; text-transform: uppercase; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px;">Pending Task Assignment</div>
              
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid ${borderColor[reminderCount]}; margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Employee Name</p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">${employeeName}</p>
              </div>

              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid ${borderColor[reminderCount]};">
                <p style="margin: 0 0 5px 0; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Date</p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">${date}</p>
              </div>
            </div>

            <!-- Action Message -->
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 14px; line-height: 1.7;">
                Please log in to the system and assign the necessary tasks to <span style="font-weight: 600;">${employeeName}</span> as soon as possible.
              </p>
              ${reminderCount === 3 ? `<p style="margin: 0; color: ${borderColor[reminderCount]}; font-size: 14px; font-weight: 600;">
                ⚠️ If tasks are not assigned immediately, this matter will be escalated to HR.
              </p>` : reminderCount === 2 ? `<p style="margin: 0; color: ${borderColor[reminderCount]}; font-size: 14px; font-weight: 600;">
                ⏰ Deadline is approaching. Please act now.
              </p>` : `<p style="margin: 0; color: #666666; font-size: 14px;">
                This is a courtesy reminder. Please assign tasks at your earliest convenience.
              </p>`}
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${applicationUrl}" style="display: inline-block; background: ${headerColors[reminderCount]}; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 14px;">
                🔗 Go to Application
              </a>
            </div>

          </div>

          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 13px; font-weight: 500;">
              This is an automated reminder
            </p>
            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
              Reminder #${reminderCount} of 3
            </p>
            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
              Please do not reply to this email. For questions, contact your HR department.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};
