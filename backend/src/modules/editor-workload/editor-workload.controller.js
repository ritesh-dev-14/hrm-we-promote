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

      const stats = {
        daily: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0 },
        weekly: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0 },
        monthly: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0 },
        allTime: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0 }
      };

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const dayOfWeek = now.getDay() || 7; // Sunday = 7
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      assignments.forEach(assignment => {
        const isCompleted = ["SUBMITTED", "VERIFIED", "COMPLETED"].includes(assignment.status);
        
        if (isCompleted) {
          completedTasks.push(assignment);
          const completedAtDate = new Date(assignment.completedAt || assignment.submittedAt || assignment.updatedAt);
          
          let tatSec = 0;
          if (assignment.startedAt && assignment.completedAt) {
            tatSec = (new Date(assignment.completedAt) - new Date(assignment.startedAt)) / 1000;
          } else if (assignment.createdAt && assignment.completedAt) {
            tatSec = (new Date(assignment.completedAt) - new Date(assignment.createdAt)) / 1000;
          }

          const mediaType = assignment.taskItem?.mediaType;

          const updateStats = (period) => {
            if (mediaType === 'VIDEO') {
              stats[period].videoCount++;
              if (tatSec > 0) {
                stats[period].videoTatSec += tatSec;
                stats[period].videoTatCount++;
              }
            } else if (mediaType === 'PIC') {
              stats[period].postCount++;
              if (tatSec > 0) {
                stats[period].postTatSec += tatSec;
                stats[period].postTatCount++;
              }
            }
          };

          updateStats('allTime');
          if (completedAtDate >= startOfMonth) updateStats('monthly');
          if (completedAtDate >= startOfWeek) updateStats('weekly');
          if (completedAtDate >= startOfDay) updateStats('daily');
          
        } else {
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
        }
      });

      const formatStats = (period) => {
        const p = stats[period];
        return {
          videosEdited: p.videoCount,
          postsEdited: p.postCount,
          // Calculate TAT in hours for precision
          videoAvgTat: p.videoTatCount > 0 ? (p.videoTatSec / p.videoTatCount / 3600).toFixed(1) : 0,
          postAvgTat: p.postTatCount > 0 ? (p.postTatSec / p.postTatCount / 3600).toFixed(1) : 0,
        };
      };

      // Sort completed tasks by completion date (newest first), limit to 10 for payload size
      completedTasks.sort((a, b) => new Date(b.completedAt || b.submittedAt || b.updatedAt) - new Date(a.completedAt || a.submittedAt || a.updatedAt));

      return {
        ...employee,
        activeTasks: activeCount,
        dueToday: dueTodayCount,
        overdue: overdueCount,
        stats: {
          daily: formatStats('daily'),
          weekly: formatStats('weekly'),
          monthly: formatStats('monthly'),
          allTime: formatStats('allTime')
        },
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
