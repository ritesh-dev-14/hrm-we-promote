module.exports = ({
  managerName,
  taskTitle,
  date,
  instructions,
}) => {
  return `
    <h2>Hello ${managerName}</h2>

    <p>A new task has been assigned to you.</p>

    <h3>${taskTitle}</h3>

    <p><b>Date:</b> ${date}</p>

    <p><b>Instructions:</b></p>

    <p>${instructions || "N/A"}</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};