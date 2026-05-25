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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Task Assignment Reminder</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .alert {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .content {
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 10px;
        }
        .footer {
          border-top: 1px solid #ddd;
          margin-top: 20px;
          padding-top: 15px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Task Assignment Reminder</h2>
        </div>

        <div class="alert">
          <strong>${reminderText[reminderCount]}</strong> - ${urgencyMessage[reminderCount]}
        </div>

        <div class="content">
          <p>Hello <strong>${managerName}</strong>,</p>
          
          <p>You have not assigned any tasks to <strong>${employeeName}</strong> for <strong>${date}</strong>.</p>
          
          <p>Please log in to the system and assign the necessary tasks to your team member.</p>
          
          <p style="color: #dc3545; font-weight: bold;">
            ⚠️ Escalation Notice: If tasks are not assigned by 3:00 PM, this matter will be escalated to HR.
          </p>
          
          <center>
            <a href="${applicationUrl}" class="button">Go to Application</a>
          </center>
        </div>

        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>If you have questions, please contact your HR department.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
