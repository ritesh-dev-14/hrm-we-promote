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
      <title>Task Assignment Escalation - ${escalationLevel}</title>
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
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        .escalation-info {
          background-color: #e7f3ff;
          border-left: 4px solid #dc3545;
          padding: 15px;
          margin: 20px 0;
        }
        .content {
          margin: 20px 0;
        }
        .details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .button {
          display: inline-block;
          background-color: #dc3545;
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
          <h2>⚠️ ESCALATION ALERT - Task Assignment Issue</h2>
        </div>

        <div class="alert">
          ESCALATION LEVEL: ${escalationLevel}
        </div>

        <div class="content">
          <p>Hello <strong>${hrName}</strong>,</p>
          
          <p>${escalationMessages[escalationLevel]}</p>
          
          <div class="escalation-info">
            <h3>Escalation Details:</h3>
            <strong>Manager:</strong> ${managerName}<br>
            <strong>Employee:</strong> ${employeeName}<br>
            <strong>Date Affected:</strong> ${date}<br>
            <strong>Issue:</strong> No tasks assigned
          </div>

          <div class="details">
            <h4>Action Required:</h4>
            <ul>
              <li>Review the manager's task assignment activity</li>
              <li>Contact the manager for explanation</li>
              <li>Ensure tasks are assigned for the specified date</li>
            </ul>
          </div>
          
          <center>
            <a href="${applicationUrl}" class="button">View in System</a>
          </center>
        </div>

        <div class="footer">
          <p>This is an automated escalation notification. Please review and take appropriate action.</p>
          <p>Escalation Level: ${escalationLevel}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
