module.exports = ({
  coordinatorName,
  employeeName,
  taskTitle,
  message,
}) => {
  return `
    <h2>Hello ${coordinatorName}</h2>

    <p>You got a text from employee ${employeeName}.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <p><b>Message:</b></p>

    <p>${message || "N/A"}</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};