const prisma = require("../../config/prisma");

/**
 * Get Editor Workload (Upgrade 6)
 */
exports.getEditorWorkload = async (req, res, next) => {
  try {
    // Find all employees
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        employeeId: true,
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workloads = await Promise.all(employees.map(async (employee) => {
      // Get all assignments for this employee
      const assignments = await prisma.taskItemAssignment.findMany({
        where: { userId: employee.id },
        include: {
          taskItem: {
            include: {
              task: { select: { projectName: true, projectId: true } }
            }
          }
        }
      });

      let activeCount = 0;
      let dueTodayCount = 0;
      let overdueCount = 0;
      let totalTatSeconds = 0;
      let tatCount = 0;

      const detailedTasks = [];
      const completedTasks = [];

      assignments.forEach(assignment => {
        const isCompleted = ["SUBMITTED", "VERIFIED", "COMPLETED"].includes(assignment.status);
        
        // Calculate TAT for completed assignments
        if (assignment.startedAt && assignment.completedAt) {
          const tat = new Date(assignment.completedAt) - new Date(assignment.startedAt);
          totalTatSeconds += tat / 1000;
          tatCount++;
        } else if (assignment.createdAt && assignment.completedAt) {
            const tat = new Date(assignment.completedAt) - new Date(assignment.createdAt);
            totalTatSeconds += tat / 1000;
            tatCount++;
        }

        if (!isCompleted) {
          activeCount++;
          detailedTasks.push(assignment);

          const dueDate = assignment.taskItem?.dueDate ? new Date(assignment.taskItem.dueDate) : null;
          if (dueDate) {
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < today) {
              overdueCount++;
            } else if (dueDate.getTime() === today.getTime()) {
              dueTodayCount++;
            }
          }
        } else {
          completedTasks.push(assignment);
        }
      });

      // Average TAT in days (1 day = 86400 seconds)
      const avgTatDays = tatCount > 0 ? (totalTatSeconds / tatCount / 86400).toFixed(1) : 0;

      // Sort completed tasks by completion date (newest first), limit to 10 for payload size
      completedTasks.sort((a, b) => new Date(b.completedAt || b.submittedAt || b.updatedAt) - new Date(a.completedAt || a.submittedAt || a.updatedAt));

      return {
        ...employee,
        activeTasks: activeCount,
        dueToday: dueTodayCount,
        overdue: overdueCount,
        avgTatDays: parseFloat(avgTatDays),
        detailedTasks: detailedTasks,
        completedTasks: completedTasks.slice(0, 20) // send top 20 recent
      };
    }));

    // Filter out employees that have absolutely no assignments at all
    const activeEditors = workloads.filter(w => w.activeTasks > 0 || w.completedTasks.length > 0 || w.detailedTasks.length > 0);

    res.json({ success: true, data: activeEditors });
  } catch (err) {
    next(err);
  }
};
