module.exports = ({
  employeeName,
  taskTitle,
}) => {
  return `
    <h2>Hello ${employeeName}</h2>

    <p>Your task has been approved.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};