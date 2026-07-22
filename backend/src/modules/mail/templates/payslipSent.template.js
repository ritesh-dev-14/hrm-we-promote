module.exports = ({
  employeeName,
  monthName,
  year,
  title,
  remarks,
  imageUrl,
  uploaderName
}) => {
  const displayTitle = title || `Payslip for ${monthName} ${year}`;

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
          
          <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">📄 ${displayTitle}</div>
            <div style="font-size: 14px; opacity: 0.9;">Your monthly payslip is ready</div>
          </div>

          <div style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hi <span style="color: #2563eb; font-weight: 600;">${employeeName}</span>,
            </p>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
              Your payslip for <strong>${monthName} ${year}</strong> has been uploaded by ${uploaderName || "HR"}.
            </p>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.5px;">Payslip Details</div>
              <div style="padding: 15px; background-color: #ffffff; border-radius: 6px; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">
                  <strong>📅 Pay Period:</strong> ${monthName} ${year}
                </p>
                ${remarks ? `<p style="margin: 8px 0 0 0; color: #334155; font-size: 14px;">
                  <strong>📝 Note from HR:</strong> ${remarks}
                </p>` : ""}
              </div>
            </div>

            ${imageUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${imageUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                👁️ View / Download Payslip Image
              </a>
            </div>
            ` : ""}
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 500;">
              Best regards,
            </p>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
                WePromote HR
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
