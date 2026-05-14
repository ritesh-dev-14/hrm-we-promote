module.exports = ({
  managerName,
  employeeName,
  taskTitle,
  remarks,
  driveLink,
}) => {
  return `
    <h2>Hello ${managerName}</h2>

    <p>${employeeName} submitted task.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <p><b>Remarks:</b> ${remarks || "N/A"}</p>

    <p>
      <a href="${driveLink}">
        View Submission
      </a>
    </p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};