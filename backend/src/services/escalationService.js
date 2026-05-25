const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { addDays, startOfDay, endOfDay } = require("date-fns");

//
// 🔥 CHECK IF MANAGER HAS ASSIGNED TASKS FOR GIVEN DATE
//
const hasTasksAssignedForDate = async (managerId, employeeId, date) => {
  const dateStart = startOfDay(date);
  const dateEnd = endOfDay(date);

  const taskAssignment = await prisma.taskAssignment.findFirst({
    where: {
      employee: {
        managerId: managerId,
      },
      userId: employeeId,
      workDate: {
        gte: dateStart,
        lte: dateEnd,
      },
      status: {
        in: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "VERIFIED", "COMPLETED"],
      },
    },
  });

  return !!taskAssignment;
};

//
// 🔥 GET MANAGER'S SUBORDINATES
//
const getManagerSubordinates = async (managerId) => {
  const subordinates = await prisma.user.findMany({
    where: {
      managerId: managerId,
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
    },
  });

  return subordinates;
};

//
// 🔥 CREATE OR GET ESCALATION RECORD
//
const getOrCreateEscalation = async (
  employeeId,
  managerId,
  escalationDate,
  type
) => {
  let escalation = await prisma.taskEscalation.findUnique({
    where: {
      employeeId_escalationDate_type: {
        employeeId,
        escalationDate,
        type,
      },
    },
  });

  if (!escalation) {
    escalation = await prisma.taskEscalation.create({
      data: {
        employeeId,
        managerId,
        escalationDate,
        type,
        status: "PENDING",
      },
      include: {
        employee: true,
        manager: true,
      },
    });
  }

  return escalation;
};

//
// 🔥 CHECK FOR MISSING TASK ASSIGNMENTS - NEXT 1 DAY & 4 DAYS
//
const checkMissingTaskAssignments = async () => {
  console.log("🔍 Checking for missing task assignments...");

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const fourDaysLater = addDays(today, 4);

  // Get all managers with employees
  const managers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      subordinates: {
        some: {
          role: "EMPLOYEE",
        },
      },
    },
    include: {
      subordinates: {
        where: {
          role: "EMPLOYEE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
        },
      },
    },
  });

  console.log(`Found ${managers.length} managers to check`);

  for (const manager of managers) {
    // Check next day (tomorrow)
    await checkTasksForDate(
      manager,
      tomorrow,
      "NEXT_DAY_MISSING"
    );

    // Check next 4 days
    await checkTasksForDate(
      manager,
      fourDaysLater,
      "FUTURE_4_DAYS_MISSING"
    );
  }

  console.log("✅ Task assignment check completed");
};

//
// 🔥 CHECK TASKS FOR SPECIFIC DATE
//
const checkTasksForDate = async (manager, date, escalationType) => {
  for (const employee of manager.subordinates) {
    const hasTask = await hasTasksAssignedForDate(
      manager.id,
      employee.id,
      date
    );

    if (!hasTask) {
      // Create escalation record if not exists
      await getOrCreateEscalation(
        employee.id,
        manager.id,
        date,
        escalationType
      );

      console.log(
        `⚠️  Missing task for ${employee.name} (${manager.name}) on ${date.toDateString()}`
      );
    }
  }
};

//
// 🔥 UPDATE ESCALATION STATUS
//
const updateEscalationStatus = async (escalationId, status, updateData = {}) => {
  return prisma.taskEscalation.update({
    where: { id: escalationId },
    data: {
      status,
      ...updateData,
    },
    include: {
      employee: true,
      manager: true,
    },
  });
};

//
// 🔥 GET PENDING ESCALATIONS FOR SENDING REMINDERS
//
const getPendingEscalations = async () => {
  const escalations = await prisma.taskEscalation.findMany({
    where: {
      status: "PENDING",
      resolvedAt: null,
    },
    include: {
      employee: true,
      manager: true,
    },
  });

  return escalations;
};

//
// 🔥 RESOLVE ESCALATION WHEN TASK IS ASSIGNED
//
const resolveEscalation = async (employeeId, date, escalationType) => {
  const escalation = await prisma.taskEscalation.findUnique({
    where: {
      employeeId_escalationDate_type: {
        employeeId,
        escalationDate: date,
        type: escalationType,
      },
    },
  });

  if (escalation && !escalation.resolvedAt) {
    return prisma.taskEscalation.update({
      where: { id: escalation.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });
  }

  return escalation;
};

module.exports = {
  checkMissingTaskAssignments,
  getOrCreateEscalation,
  updateEscalationStatus,
  getPendingEscalations,
  hasTasksAssignedForDate,
  getManagerSubordinates,
  checkTasksForDate,
  resolveEscalation,
};
