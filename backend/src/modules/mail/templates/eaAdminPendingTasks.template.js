const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (value) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

module.exports = ({ adminName, tasks }) => {
  const taskRows = tasks.length
    ? tasks.map((assignment) => `
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #111827;">${escapeHtml(assignment.task?.projectName || "Untitled Task")}</strong>
          ${assignment.task?.description
            ? `<div style="color: #64748b; font-size: 13px; margin-top: 5px;">${escapeHtml(assignment.task.description)}</div>`
            : ""}
        </td>
        <td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #334155;">
          ${escapeHtml(assignment.createdBy?.name || assignment.assignedBy || "EA")}
        </td>
        <td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #334155;">
          ${escapeHtml(assignment.status)}
        </td>
        <td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #334155;">
          ${formatDate(assignment.completionDate)}
        </td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="4" style="padding: 24px; text-align: center; color: #64748b;">
          No pending tasks are currently assigned to you.
        </td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: Arial, sans-serif;">
      <div style="max-width: 760px; margin: 0 auto; background: #ffffff;">
        <div style="background: #1d4ed8; padding: 28px 32px; color: #ffffff;">
          <div style="font-size: 24px; font-weight: 700;">Pending EA Tasks</div>
          <div style="font-size: 14px; margin-top: 8px; opacity: 0.92;">
            6 PM daily summary
          </div>
        </div>

        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #334155;">Hi ${escapeHtml(adminName)},</p>

          <div style="margin: 20px 0; padding: 18px; background: #eff6ff; border-left: 4px solid #2563eb;">
            <span style="color: #64748b; font-size: 13px;">TOTAL PENDING TASKS</span>
            <div style="font-size: 34px; line-height: 1.2; font-weight: 700; color: #1d4ed8;">
              ${tasks.length}
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #475569;">Task</th>
                <th style="padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #475569;">Assigned By</th>
                <th style="padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #475569;">Status</th>
                <th style="padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #475569;">Completion Date</th>
              </tr>
            </thead>
            <tbody>${taskRows}</tbody>
          </table>
        </div>

        <div style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e5e7eb; color: #94a3b8; font-size: 12px;">
          This is an automated message from WePromote HRM. Please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;
};
