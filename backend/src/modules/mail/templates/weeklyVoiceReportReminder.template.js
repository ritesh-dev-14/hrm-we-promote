module.exports = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background-color: #0B1120; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    .btn { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎙️ Weekly Voice Report Reminder</h2>
    </div>
    <div class="content">
      <p>Hello ${data.name},</p>
      
      <p>This is a gentle reminder that today is <strong>Saturday</strong>, which means the <strong>Weekly Voice Reports</strong> are due.</p>
      
      <p><strong>For Managers:</strong> Please remember to record and submit a voice report for <strong>each</strong> of your active clients. You will not be able to log out today until all your active projects have a submitted voice report.</p>
      
      <p><strong>For Admins & EAs:</strong> You can review the submitted voice reports on the company dashboard as they come in.</p>
      
      <div style="text-align: center;">
        <a href="${data.applicationUrl}/manager/weekly-voice-report" class="btn">Go to Dashboard</a>
      </div>
      
      <p style="margin-top: 20px;">Thank you for your cooperation and have a great weekend!</p>
    </div>
    <div class="footer">
      <p>Automated notification from HRM System</p>
    </div>
  </div>
</body>
</html>
`;
