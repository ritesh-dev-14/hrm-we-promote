const { addDays, startOfDay, endOfDay } = require("date-fns");
const escalationService = require("./escalationService");

//
// 🔥 AUTO-RESOLVE ESCALATIONS WHEN TASK IS ASSIGNED
// Call this function whenever a new task is assigned to an employee
//
const autoResolveEscalation = async (
  managerId,
  employeeId,
  taskDate
) => {
  try {
    

    // Check both escalation types
    const escalationTypes = [
      "NEXT_DAY_MISSING",
      "FUTURE_4_DAYS_MISSING",
    ];

    for (const type of escalationTypes) {
      await escalationService.resolveEscalation(
        employeeId,
        taskDate,
        type
      );
    }


  } catch (error) {
    console.error("❌ Error auto-resolving escalations:", error);
    // Don't throw - this should not break task assignment
  }
};

//
// 🔥 RESOLVE ALL ESCALATIONS FOR MANAGER'S EMPLOYEE ON SPECIFIC DATE
//
const resolveAllEscalationsForDate = async (
  managerId,
  employeeId,
  date
) => {
  try {
    const escalations = await escalationService.getPendingEscalations();

    const relevantEscalations = escalations.filter(
      (e) =>
        e.managerId === managerId &&
        e.employeeId === employeeId &&
        new Date(e.escalationDate).toDateString() ===
        new Date(date).toDateString()
    );

    for (const escalation of relevantEscalations) {
      await escalationService.updateEscalationStatus(
        escalation.id,
        "RESOLVED",
        {
          resolvedAt: new Date(),
        }
      );
    }

    if (relevantEscalations.length > 0) {
      
    }
  } catch (error) {
    console.error("❌ Error resolving escalations:", error);
  }
};

module.exports = {
  autoResolveEscalation,
  resolveAllEscalationsForDate,
};
