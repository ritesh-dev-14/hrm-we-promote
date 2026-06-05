module.exports = ({
  employeeName,
  taskTitle,
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
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">✓ Task Approved</div>
            <div style="font-size: 14px; opacity: 0.9;">Great news! Your task has been successfully approved</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Greeting -->
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #667eea; font-weight: 600;">${employeeName}</span>,
            </p>

            <!-- Approval Message -->
            <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                We're pleased to inform you that your task has been <span style="color: #667eea; font-weight: 600;">successfully approved</span>. You can now proceed with its execution.
              </p>
            </div>

            <!-- Task Details -->
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; color: #888888; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px;">Task Details</div>
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #764ba2;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                  <span style="color: #999999;">📋 Task Name</span>
                </p>
                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">
                  ${taskTitle}
                </p>
              </div>
            </div>

            <!-- Action Message -->
            <p style="color: #555555; font-size: 14px; margin-bottom: 30px; line-height: 1.6; text-align: center;">
              <span style="display: inline-block; background-color: #e8f5e9; color: #2e7d32; padding: 10px 20px; border-radius: 20px; font-size: 13px;">
                ✓ Status: Ready to Execute
              </span>
            </p>

          </div>

          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">
              Best regards,
            </p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
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