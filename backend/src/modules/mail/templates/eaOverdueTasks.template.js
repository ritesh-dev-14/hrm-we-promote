const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

module.exports = ({ recipientName, tasks, date, applicationUrl }) => {
  const rows = tasks.map((assignment) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">
        <strong>${escapeHtml(assignment.task?.projectName || "Untitled task")}</strong>
        ${assignment.task?.description
          ? `<div style="margin-top:4px;color:#64748b">${escapeHtml(assignment.task.description)}</div>`
          : ""}
      </td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">
        ${escapeHtml(assignment.assignedTo?.name || "Unknown")}
        <div style="color:#64748b;font-size:12px">${escapeHtml(assignment.assignedTo?.role || "")}</div>
      </td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">
        ${escapeHtml(assignment.createdBy?.name || assignment.assignedBy || "EA")}
      </td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">${formatDate(assignment.completionDate)}</td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">${escapeHtml(assignment.status)}</td>
    </tr>
  `).join("");
  const dashboardUrl = `${String(applicationUrl || "").replace(/\/+$/, "")}/ea-overdue-tasks`;

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:900px;margin:auto;padding:28px;background:#fff;border-radius:12px">
          <h2 style="margin-top:0">Overdue EA-Assigned Tasks</h2>
          <p>Hello ${escapeHtml(recipientName || "there")},</p>
          <p>${tasks.length} task${tasks.length === 1 ? "" : "s"} due today or earlier remain incomplete as of ${escapeHtml(date)}.</p>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;text-align:left;font-size:14px">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="padding:12px">Task</th>
                  <th style="padding:12px">Assigned To</th>
                  <th style="padding:12px">Assigned By</th>
                  <th style="padding:12px">Due Date</th>
                  <th style="padding:12px">Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <p style="margin-top:24px">
            <a href="${escapeHtml(dashboardUrl)}" style="color:#4f46e5">Open overdue task dashboard</a>
          </p>
        </div>
      </body>
    </html>
  `;
};
