//
// 🔥 EXAMPLE: How to Auto-Resolve Escalations When Task is Assigned
// 
// This is an example of how to integrate auto-escalation resolution
// in your existing task creation/assignment endpoints
//

const { autoResolveEscalation } = require("../utils/escalationHelper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//
// 🔥 EXAMPLE TASK CREATION ENDPOINT WITH AUTO-RESOLVE
//
const createTaskExample = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      assignedToUsers, // Array of user IDs
      managerId,
      // ... other fields
    } = req.body;

    // 1. Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        date: new Date(date),
        createdById: managerId,
        // ... other fields
      },
    });

    // 2. Create task assignments
    for (const userId of assignedToUsers) {
      await prisma.taskAssignment.create({
        data: {
          taskId: task.id,
          userId: userId,
          workDate: new Date(date),
          status: "ASSIGNED",
        },
      });

      // 3. ✅ AUTO-RESOLVE ESCALATIONS when task is assigned
      await autoResolveEscalation(managerId, userId, new Date(date));

      console.log(`✅ Task assigned to ${userId} and escalation resolved`);
    }

    res.json({
      success: true,
      message: "Task created and assigned successfully",
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create task" });
  }
};

//
// 🔥 EXAMPLE: UPDATE EXISTING TASK ENDPOINT
//
const updateTaskAssignmentExample = async (req, res) => {
  try {
    const { taskId, userId, assignedDate } = req.body;

    // 1. Update task assignment
    const assignment = await prisma.taskAssignment.update({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
      data: {
        status: "ASSIGNED",
        workDate: new Date(assignedDate),
      },
      include: {
        task: {
          select: {
            createdById: true,
          },
        },
      },
    });

    // 2. ✅ AUTO-RESOLVE ESCALATIONS
    await autoResolveEscalation(
      assignment.task.createdById, // managerId (person who created task)
      userId, // employeeId
      new Date(assignedDate)
    );

    res.json({
      success: true,
      message: "Task assignment updated and escalation resolved",
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update assignment",
    });
  }
};

//
// 🔥 BULK TASK ASSIGNMENT WITH AUTO-RESOLVE
//
const bulkAssignTasksExample = async (req, res) => {
  try {
    const { taskIds, employeeIds, assignDate, managerId } = req.body;

    const results = [];

    for (const taskId of taskIds) {
      for (const employeeId of employeeIds) {
        // 1. Create/update task assignment
        const assignment = await prisma.taskAssignment.upsert({
          where: {
            taskId_userId: {
              taskId,
              employeeId,
            },
          },
          update: {
            status: "ASSIGNED",
            workDate: new Date(assignDate),
          },
          create: {
            taskId,
            userId: employeeId,
            workDate: new Date(assignDate),
            status: "ASSIGNED",
          },
        });

        // 2. ✅ AUTO-RESOLVE ESCALATIONS for each assignment
        await autoResolveEscalation(
          managerId,
          employeeId,
          new Date(assignDate)
        );

        results.push({
          taskId,
          employeeId,
          status: "assigned",
        });
      }
    }

    res.json({
      success: true,
      message: `Assigned ${results.length} task(s) and resolved escalations`,
      data: results,
    });
  } catch (error) {
    console.error("Error in bulk assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk assign tasks",
    });
  }
};

//
// 🔥 INTEGRATION CHECKLIST
//
// ☐ 1. Import autoResolveEscalation in your task route handlers
// ☐ 2. Call it after every task assignment creation
// ☐ 3. Pass: managerId, employeeId, taskDate
// ☐ 4. Test with existing task endpoints
// ☐ 5. Verify escalation records are marked as RESOLVED
// ☐ 6. Monitor logs for "✅ Escalations auto-resolved" messages

//
// 🔥 WHERE TO ADD THIS:
//
// Files that need integration:
// 1. src/modules/task/task.controller.js (or wherever task creation happens)
// 2. src/modules/task-item/task-item.controller.js (if using task items)
// 3. Any other endpoints that create TaskAssignment records

//
// 🔥 TESTING AUTO-RESOLVE:
//
// 1. Create escalation via: POST /api/escalations/check/manual
// 2. Create task assignment with one of the escalated employees
// 3. Query: GET /api/escalations/pending
// 4. Verify escalation status changed to RESOLVED and resolvedAt is set

module.exports = {
  createTaskExample,
  updateTaskAssignmentExample,
  bulkAssignTasksExample,
};
