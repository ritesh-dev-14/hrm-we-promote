module.exports = ({
  employeeName,
  coordinatorName,
  taskTitle,
  message,
}) => {
  return `
    <h2>Hello ${employeeName}</h2>

    <p>You got a text from coordinator ${coordinatorName}.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <p><b>Message:</b></p>

    <p>${message || "N/A"}</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};