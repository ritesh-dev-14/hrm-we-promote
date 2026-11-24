const prisma = require("../../config/prisma");

const getValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCompletionDate = (assignment) =>
  getValidDate(assignment.submittedAt) || getValidDate(assignment.completedAt);

const getWeekdaysElapsed = (startDate, endDate) => {
  const date = new Date(startDate);
  date.setHours(0, 0, 0, 0);
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);

  let weekdays = 0;
  while (date <= lastDate) {
    if (date.getDay() !== 0 && date.getDay() !== 6) weekdays++;
    date.setDate(date.getDate() + 1);
  }

  return Math.max(weekdays, 1);
};

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
        dailyVideoTarget: true,
        dailyPostTarget: true,
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
        daily: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0, videoHitDays: 0, postHitDays: 0, workingDays: 1 },
        weekly: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0, videoHitDays: 0, postHitDays: 0, workingDays: 1 },
        monthly: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0, videoHitDays: 0, postHitDays: 0, workingDays: 1 },
        allTime: { videoCount: 0, postCount: 0, videoTatSec: 0, postTatSec: 0, videoTatCount: 0, postTatCount: 0, videoHitDays: 0, postHitDays: 0, workingDays: 1 }
      };

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const dayOfWeek = now.getDay() || 7; // Sunday = 7
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      stats.weekly.workingDays = getWeekdaysElapsed(startOfWeek, now);
      stats.monthly.workingDays = getWeekdaysElapsed(startOfMonth, now);

      const dailyCompletionMap = {};

      assignments.forEach(assignment => {
        const isCompleted = ["SUBMITTED", "VERIFIED", "COMPLETED"].includes(assignment.status);
        
        if (isCompleted) {
          completedTasks.push(assignment);
          const completedAtDate = getCompletionDate(assignment);
          
          let tatSec = 0;
          if (assignment.startedAt && assignment.completedAt) {
            tatSec = (new Date(assignment.completedAt) - new Date(assignment.startedAt)) / 1000;
          } else if (assignment.createdAt && assignment.completedAt) {
            tatSec = (new Date(assignment.completedAt) - new Date(assignment.createdAt)) / 1000;
          }

          const mediaType = assignment.taskItem?.mediaType;

          if (completedAtDate) {
            const dateKey = completedAtDate.toISOString().split('T')[0];
            if (!dailyCompletionMap[dateKey]) {
              dailyCompletionMap[dateKey] = { videoCount: 0, postCount: 0, date: completedAtDate };
            }
            if (mediaType === 'VIDEO') dailyCompletionMap[dateKey].videoCount++;
            if (mediaType === 'PIC') dailyCompletionMap[dateKey].postCount++;
          }

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
          if (completedAtDate && completedAtDate >= startOfMonth) updateStats('monthly');
          if (completedAtDate && completedAtDate >= startOfWeek) updateStats('weekly');
          if (completedAtDate && completedAtDate >= startOfDay) updateStats('daily');
          
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

      const dailyVideoTarget = employee.dailyVideoTarget || 0;
      const dailyPostTarget = employee.dailyPostTarget || 0;

      Object.values(dailyCompletionMap).forEach(day => {
        const isVideoHit = dailyVideoTarget > 0 && day.videoCount >= dailyVideoTarget;
        const isPostHit = dailyPostTarget > 0 && day.postCount >= dailyPostTarget;

        const updateHitStats = (period) => {
          if (isVideoHit) stats[period].videoHitDays++;
          if (isPostHit) stats[period].postHitDays++;
        };

        updateHitStats('allTime');
        if (day.date >= startOfMonth) updateHitStats('monthly');
        if (day.date >= startOfWeek) updateHitStats('weekly');
        if (day.date >= startOfDay) updateHitStats('daily');
      });

      const formatStats = (period) => {
        const p = stats[period];
        return {
          videosEdited: p.videoCount,
          postsEdited: p.postCount,
          // Calculate TAT in hours for precision
          videoAvgTat: p.videoTatCount > 0 ? (p.videoTatSec / p.videoTatCount / 3600).toFixed(1) : 0,
          postAvgTat: p.postTatCount > 0 ? (p.postTatSec / p.postTatCount / 3600).toFixed(1) : 0,
          averageVideosPerDay: period === 'allTime'
            ? null
            : Number((p.videoCount / Math.max(p.workingDays, 1)).toFixed(1)),
          averagePostsPerDay: period === 'allTime'
            ? null
            : Number((p.postCount / Math.max(p.workingDays, 1)).toFixed(1)),
          videoHitDays: p.videoHitDays,
          postHitDays: p.postHitDays,
          workingDays: p.workingDays,
        };
      };

      // Sort completed tasks by completion date (newest first), limit to 10 for payload size
      completedTasks.sort((a, b) => {
        const dateA = getCompletionDate(a) || getValidDate(a.createdAt) || new Date(0);
        const dateB = getCompletionDate(b) || getValidDate(b.createdAt) || new Date(0);
        return dateB - dateA;
      });

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

/**
 * Update Editor Targets
 */
exports.updateEditorTargets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dailyVideoTarget, dailyPostTarget } = req.body;

    const updateData = {};
    if (dailyVideoTarget !== undefined) updateData.dailyVideoTarget = parseInt(dailyVideoTarget) || 0;
    if (dailyPostTarget !== undefined) updateData.dailyPostTarget = parseInt(dailyPostTarget) || 0;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, dailyVideoTarget: true, dailyPostTarget: true }
    });

    res.json({ success: true, data: user, message: "Targets updated successfully" });
  } catch (err) {
    next(err);
  }
};
