module.exports = ({
  employeeName,
  taskTitle,
  itemTitle,
  instructions,
}) => {
  return `
    <h2>Hello ${employeeName}</h2>

    <p>You have been assigned a task item.</p>

    <p><b>Task:</b> ${taskTitle}</p>

    <p><b>Item:</b> ${itemTitle}</p>

    <p><b>Instructions:</b></p>

    <p>${instructions || "N/A"}</p>

    <br/>

    <p>Regards,</p>
    <p>WePromote</p>
  `;
};