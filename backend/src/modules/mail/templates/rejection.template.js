module.exports = ({
  employeeName,
  taskTitle,
  reason,
}) => {
  return `
    <h2>Hello ${employeeName}</h2>

    <p>Your task has been rejected.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <p><b>Reason:</b> ${reason}</p>

    <br/>

    <p>Please correct and resubmit.</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};