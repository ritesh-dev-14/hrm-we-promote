module.exports = ({
  userName,
  projectName,
  uploadDate,
  clientName,
  totalUploads,
  items,
  applicationUrl,
}) => {
  const itemsHtml =
    items && items.length
      ? `<table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr style="background:#f0ebfa;">
              <th style="text-align:left;padding:8px 12px;font-size:13px;color:#6C3FC5;border-bottom:1px solid #e0d6f5;">Data Type</th>
              <th style="text-align:left;padding:8px 12px;font-size:13px;color:#6C3FC5;border-bottom:1px solid #e0d6f5;">Platform</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, i) =>
                  `<tr style="background:${i % 2 === 0 ? "#fff" : "#faf8ff"};">
                    <td style="padding:8px 12px;font-size:14px;color:#333;border-bottom:1px solid #f0ebfa;">${item.dataType}</td>
                    <td style="padding:8px 12px;font-size:14px;color:#555;border-bottom:1px solid #f0ebfa;">${item.platform || "—"}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>`
      : `<p style="margin:0;color:#555;font-size:14px;font-style:italic;">No upload items specified.</p>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f0ebfa;">
        <div style="width:100%;padding:28px 0;">
          <div style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(108,63,197,0.12);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6C3FC5 0%,#4A2899 100%);padding:36px 32px;text-align:center;color:#fff;">
              <div style="font-size:40px;margin-bottom:10px;">📌</div>
              <h1 style="margin:0;font-size:26px;font-weight:700;line-height:1.3;">Today's Upload Alert</h1>
              <p style="margin:10px 0 0;font-size:15px;opacity:0.9;">A new upload has been recorded for <strong>${uploadDate}</strong></p>
            </div>

            <!-- Body -->
            <div style="padding:32px;">
              <p style="margin:0 0 20px 0;color:#333;font-size:16px;line-height:1.6;">Hi <strong>${userName || "there"}</strong>,</p>
              <p style="margin:0 0 24px 0;color:#555;font-size:15px;line-height:1.7;">An upload has been added to the system for <strong>today (${uploadDate})</strong>. Please review the details below:</p>

              <!-- Upload Info Card -->
              <div style="background:#faf8ff;border:1px solid #e0d6f5;border-radius:12px;padding:24px;margin-bottom:24px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#888;width:140px;">Project Name</td>
                    <td style="padding:6px 0;font-size:14px;color:#222;font-weight:600;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#888;">Upload Date</td>
                    <td style="padding:6px 0;font-size:14px;color:#222;font-weight:600;">${uploadDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#888;">Client</td>
                    <td style="padding:6px 0;font-size:14px;color:#222;font-weight:600;">${clientName || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#888;">Total Uploads</td>
                    <td style="padding:6px 0;font-size:14px;color:#6C3FC5;font-weight:700;">${totalUploads}</td>
                  </tr>
                </table>
              </div>

              <!-- Upload Items -->
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 10px 0;font-size:15px;font-weight:600;color:#333;">Upload Items:</p>
                ${itemsHtml}
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-top:28px;">
                <a href="${applicationUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6C3FC5,#4A2899);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.3px;">
                  View in HRM Portal
                </a>
              </div>
              <p style="margin:20px 0 0 0;color:#aaa;font-size:13px;text-align:center;">You will also see a sidebar notification and popup for this upload in the HRM portal.</p>
            </div>

            <!-- Footer -->
            <div style="padding:20px 32px;background:#faf8ff;border-top:1px solid #e0d6f5;color:#999;font-size:13px;text-align:center;">
              <p style="margin:0;">This is an automated notification from <strong style="color:#6C3FC5;">WePromote HRM</strong>.</p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
};
