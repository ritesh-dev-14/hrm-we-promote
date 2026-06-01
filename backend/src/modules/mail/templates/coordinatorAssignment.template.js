module.exports = ({
  recipientName,
  coordinatorName,
  taskTitle,
  completionDate,
  assignedBy,
  recipientRole,
}) => {
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString()
    : "N/A";

  return `
    <h2>Hello ${recipientName}</h2>

    <p>You got task from coordinator ${coordinatorName}.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <p><b>Assigned By:</b> ${assignedBy || coordinatorName}</p>

    <p><b>Recipient Role:</b> ${recipientRole || "N/A"}</p>

    <p><b>Completion Date:</b> ${formattedDate}</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};