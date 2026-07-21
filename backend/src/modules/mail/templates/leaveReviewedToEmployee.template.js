module.exports = ({
  employeeName,
  leaveType,
  startDate,
  endDate,
  status,
  reason
}) => {
  const isApproved = status === "APPROVED";
  const statusColor = isApproved ? "#2e7d32" : "#d32f2f";
  const bgColor = isApproved ? "#e8f5e9" : "#ffebee";
  const title = isApproved ? "Leave Approved" : "Leave Rejected";
  const icon = isApproved ? "✓" : "✕";

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
          
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">${icon} ${title}</div>
            <div style="font-size: 14px; opacity: 0.9;">Update on your recent leave application</div>
          </div>

          <div style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #4f46e5; font-weight: 600;">${employeeName}</span>,
            </p>

            <div style="background-color: ${bgColor}; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                Your application for ${leaveType} leave has been <span style="color: ${statusColor}; font-weight: 600;">${status}</span>.
              </p>
            </div>

            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; color: #888888; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px;">Leave Details</div>
              <div style="padding: 15px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #7c3aed;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                  <span style="color: #999999;">📅 Duration:</span> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}
                </p>
                ${reason ? `<p style="margin: 0; color: #666666; font-size: 13px;">
                  <span style="color: #999999;">📝 Reason:</span> ${reason}
                </p>` : ""}
              </div>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">
              Best regards,
            </p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
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
