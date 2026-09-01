const prisma = require("../../config/prisma");

const normalizeDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return {};

  return {
    gte: startDate ? new Date(startDate) : undefined,
    lte: endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : undefined,
  };
};

const buildSocialMediaDataSummary = async (sheets, dateFilter = {}) => {
  const projectMap = {};

  for (const sheet of sheets) {
    const pid = sheet.project?.id || sheet.projectId;
    const projectName = sheet.project?.projectName || "Unknown Project";
    
    if (!pid) continue;

    if (!projectMap[pid]) {
      // Count VERIFIED edit tasks for this project
      const verifiedEditTasksCount = await prisma.taskItemAssignment.count({
        where: {
          status: "VERIFIED",
          taskItem: {
            task: { projectName: projectName }
          },
          ...(Object.keys(dateFilter).length > 0 ? { verifiedAt: dateFilter } : {})
        }
      });

      projectMap[pid] = {
        projectId: pid,
        projectName: projectName,
        clientName: sheet.project?.clientName || "Unknown Client",
        phone: sheet.project?.phone || null,
        totalPlanned: 0,
        totalPosted: 0,
        totalLeftToPost: 0,
        totalEdited: verifiedEditTasksCount, // Start with verified edit tasks
        totalLeftToEdit: 0,
        totalApproved: 0,
      };
    }

    const projectSummary = projectMap[pid];
    const plannedCount = (sheet.totalReels || 0) + (sheet.totalPosts || 0);
    const postedCount = (sheet.totalReelsUploaded || 0) + (sheet.totalPostsUploaded || 0);
    const editedCount = sheet.days.reduce((count, day) => {
      const submissionLinks = Array.isArray(day.submissionLinks) ? day.submissionLinks.filter(Boolean) : [];
      const contentLinks = Array.isArray(day.contentUploadLinks) ? day.contentUploadLinks.filter(Boolean) : [];
      const videoLinks = Array.isArray(day.videoUploadLinks) ? day.videoUploadLinks.filter(Boolean) : [];
      const hasAnyWork = submissionLinks.length > 0 || contentLinks.length > 0 || videoLinks.length > 0 || day.uploadStatus === "APPROVED";
      return count + (hasAnyWork ? 1 : 0);
    }, 0);

    projectSummary.totalPlanned += plannedCount;
    projectSummary.totalPosted += postedCount;
    projectSummary.totalEdited += editedCount;
    projectSummary.totalApproved += sheet.days.filter((day) => day.uploadStatus === "APPROVED").length;
  }

  return Object.values(projectMap).map((project) => ({
    ...project,
    totalLeftToPost: Math.max(0, project.totalPlanned - project.totalPosted),
    totalLeftToEdit: Math.max(0, project.totalPlanned - project.totalEdited),
    postedProgress: project.totalPlanned > 0 ? Math.round((project.totalPosted / project.totalPlanned) * 100) : 0,
    editProgress: project.totalPlanned > 0 ? Math.round((project.totalEdited / project.totalPlanned) * 100) : 0,
  }));
};

exports.getEmployeeStats = async (userId) => {
  const assignments = await prisma.taskItemAssignment.findMany({
    where: { userId },
  });

  const totalTasks = assignments.length;
  const completedTasks = assignments.filter((a) => a.status === "COMPLETED" || a.status === "VERIFIED").length;
  
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // SHOOT WORKSPACE SUBTASKS
  const shootMemberships = await prisma.shootWorkspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          tasks: {
            include: {
              subtasks: true
            }
          }
        }
      }
    }
  });

  let totalShoots = 0;
  let completedShoots = 0;
  let pendingShoots = 0;
  const shootSubtasks = [];

  shootMemberships.forEach((membership) => {
    if (membership.workspace && membership.workspace.tasks) {
      membership.workspace.tasks.forEach((task) => {
        if (task.subtasks) {
          task.subtasks.forEach((subtask) => {
            totalShoots += 1;
            if (subtask.status === "APPROVED") {
              completedShoots += 1;
            } else {
              pendingShoots += 1;
            }
            shootSubtasks.push({
              id: subtask.id,
              title: subtask.title,
              type: subtask.type,
              status: subtask.status,
              workspaceName: membership.workspace.name,
              taskTitle: task.title,
              date: task.date
            });
          });
        }
      });
    }
  });

  const shootCompletionPercentage = totalShoots > 0 ? Math.round((completedShoots / totalShoots) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    completionPercentage,
    totalShoots,
    completedShoots,
    pendingShoots,
    shootCompletionPercentage,
    shootSubtasks
  };
};

exports.getAllEmployeesStats = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "MANAGER", "COORDINATOR"] }
    },
    include: {
      department: true,
      userDepartments: {
        include: {
          department: true
        }
      },
      taskItemAssignments: true,
      shootWorkspaceMemberships: {
        include: {
          workspace: {
            include: {
              tasks: {
                include: {
                  subtasks: true
                }
              }
            }
          }
        }
      }
    }
  });

  const report = users.map((user) => {
    const totalTasks = user.taskItemAssignments.length;
    const completedTasks = user.taskItemAssignments.filter((a) => a.status === "COMPLETED" || a.status === "VERIFIED").length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    let totalShoots = 0;
    let completedShoots = 0;

    if (user.shootWorkspaceMemberships) {
      user.shootWorkspaceMemberships.forEach(membership => {
        if (membership.workspace && membership.workspace.tasks) {
          membership.workspace.tasks.forEach(task => {
            totalShoots += task.subtasks.length;
            completedShoots += task.subtasks.filter(s => s.status === "APPROVED").length;
          });
        }
      });
    }

    const shootCompletionPercentage = totalShoots > 0 ? Math.round((completedShoots / totalShoots) * 100) : 0;
    
    // Resolve department: fallback to userDepartments if department is null
    let departmentName = null;
    if (user.department?.name) {
      departmentName = user.department.name;
    } else if (user.userDepartments && user.userDepartments.length > 0) {
      departmentName = user.userDepartments.map(ud => ud.department.name).join(", ");
    }

    return {
      userId: user.id,
      employeeId: user.employeeId,
      name: user.name,
      department: departmentName,
      totalTasks,
      completedTasks,
      completionPercentage,
      totalShoots,
      completedShoots,
      shootCompletionPercentage
    };
  });

  return report;
};

exports.getEmployeeProjectStats = async (employeeId) => {
  const assignments = await prisma.taskItemAssignment.findMany({
    where: { userId: employeeId },
    include: {
      taskItem: {
        include: {
          task: true
        }
      }
    }
  });

  const projectsMap = {};
  
  assignments.forEach((assignment) => {
    const projectName = assignment.taskItem?.task?.projectName || "General Project";
    
    if (!projectsMap[projectName]) {
      projectsMap[projectName] = {
        projectName,
        totalTasks: 0,
        completedTasks: 0,
        type: "PROJECT"
      };
    }
    
    projectsMap[projectName].totalTasks += 1;
    if (assignment.status === "COMPLETED" || assignment.status === "VERIFIED") {
      projectsMap[projectName].completedTasks += 1;
    }
  });

  // SHOOT TASKS
  const shootMemberships = await prisma.shootWorkspaceMember.findMany({
    where: { userId: employeeId },
    include: {
      workspace: {
        include: {
          tasks: {
            include: {
              subtasks: true
            }
          }
        }
      }
    }
  });

  shootMemberships.forEach(membership => {
    const workspaceName = membership.workspace.name;
    if (!projectsMap[workspaceName]) {
      projectsMap[workspaceName] = {
        projectName: workspaceName,
        totalTasks: 0,
        completedTasks: 0,
        type: "SHOOT"
      };
    }

    if (membership.workspace.tasks) {
      membership.workspace.tasks.forEach(task => {
        if (task.subtasks) {
          projectsMap[workspaceName].totalTasks += task.subtasks.length;
          projectsMap[workspaceName].completedTasks += task.subtasks.filter(s => s.status === "APPROVED").length;
        }
      });
    }
  });

  const report = Object.values(projectsMap).map((proj) => ({
    ...proj,
    completionPercentage: proj.totalTasks > 0 ? Math.round((proj.completedTasks / proj.totalTasks) * 100) : 0,
  }));

  return report;
};

// ── getProjectsOverview ──────────────────────────────────────────────────────
// Returns aggregated data for Social Media, Meta Ads (marketing), and SEO
// filtered by optional date range.
exports.getSocialMediaProjectDataSummary = async ({ projectId, startDate, endDate } = {}) => {
  const dateFilter = normalizeDateRange(startDate, endDate);

  const sheets = await prisma.projectMonthlySheet.findMany({
    where: {
      ...(projectId ? { projectId } : {
        project: {
          department: { name: { contains: "Social Media", mode: "insensitive" } },
        },
      }),
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
    },
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
          clientName: true,
          phone: true,
        },
      },
      days: {
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        select: {
          id: true,
          date: true,
          uploadStatus: true,
          submissionLinks: true,
          contentUploadLinks: true,
          videoUploadLinks: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = await buildSocialMediaDataSummary(sheets, dateFilter);
  return projectId ? result[0] || null : result;
};

exports.getProjectsOverview = async ({ startDate, endDate, type }) => {
  // Build date range
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter = normalizeDateRange(startDate, endDate);
  }

  const result = {};

  // ── Social Media ────────────────────────────────────────────────────────────
  if (!type || type === 'social-media' || type === 'social-media-data') {
    const smSheets = await prisma.projectMonthlySheet.findMany({
      where: {
        project: {
          department: { name: { contains: 'Social Media', mode: 'insensitive' } },
        },
        ...(startDate || endDate ? {
          createdAt: dateFilter,
        } : {}),
      },
      include: {
        project: {
          select: { id: true, projectName: true, clientName: true, phone: true },
        },
        days: {
          where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
          select: {
            id: true,
            date: true,
            reelType: true,
            postType: true,
            uploadStatus: true,
            submissionLinks: true,
            contentUploadLinks: true,
            videoUploadLinks: true,
          },
        },
      },
    });

    // Group by project
    const projectMap = {};
    for (const sheet of smSheets) {
      const pid = sheet.project.id;
      if (!projectMap[pid]) {
        projectMap[pid] = {
          projectId: pid,
          projectName: sheet.project.projectName,
          clientName: sheet.project.clientName,
          phone: sheet.project.phone,
          reelsPlanned: 0,
          reelsPosted: 0,
          postsPlanned: 0,
          postsPosted: 0,
        };
      }
      const p = projectMap[pid];
      p.reelsPlanned  += sheet.totalReels          || 0;
      p.postsPlanned  += sheet.totalPosts           || 0;
      p.reelsPosted   += sheet.totalReelsUploaded   || 0;
      p.postsPosted   += sheet.totalPostsUploaded   || 0;
    }

    result.socialMedia = Object.values(projectMap);

    if (type === 'social-media-data') {
      result.socialMediaData = await buildSocialMediaDataSummary(smSheets, dateFilter);
    }
  }

  // ── Meta Ads ─────────────────────────────────────────────────────────────────
  if (!type || type === 'meta-ads') {
    const marketingReports = await prisma.marketingReport.findMany({
      where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
      include: {
        project: {
          select: { id: true, projectName: true, clientName: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by project
    const adMap = {};
    for (const r of marketingReports) {
      const pid = r.projectId;
      if (!adMap[pid]) {
        adMap[pid] = {
          projectId: pid,
          projectName: r.project?.projectName,
          clientName:  r.clientName || r.project?.clientName,
          totalReach:  0,
          totalSpend:  0,
          totalLeads:  0,
          reportCount: 0,
          reports:     [],
        };
      }
      adMap[pid].totalReach  += r.todayReachObtained  || 0;
      adMap[pid].totalSpend  += r.todayAmountSpend     || 0;
      adMap[pid].totalLeads  += r.leadObtained         || 0;
      adMap[pid].reportCount += 1;
      adMap[pid].reports.push({
        id:           r.id,
        date:         r.date,
        reach:        r.todayReachObtained,
        spend:        r.todayAmountSpend,
        leads:        r.leadObtained,
        isAdRunning:  r.isAdRunning,
        typeOfAds:    r.typeOfAds,
        areaName:     r.areaName,
      });
    }

    result.metaAds = Object.values(adMap);
  }

  // ── SEO ───────────────────────────────────────────────────────────────────────
  if (!type || type === 'seo') {
    const seoReports = await prisma.seoReport.findMany({
      where: Object.keys(dateFilter).length > 0 ? { checkDate: dateFilter } : {},
      include: {
        project: {
          select: { id: true, projectName: true, clientName: true },
        },
        manager: {
          select: { id: true, name: true },
        },
      },
      orderBy: { checkDate: 'desc' },
    });

    // Group by project — latest report first
    const seoMap = {};
    for (const r of seoReports) {
      const pid = r.projectId;
      if (!seoMap[pid]) {
        seoMap[pid] = {
          projectId:   pid,
          projectName: r.project?.projectName,
          clientName:  r.project?.clientName,
          latestReport: null,
          reports:     [],
        };
      }
      const entry = {
        id:          r.id,
        keywords:    r.keywords,
        rankingNo:   r.rankingNo,
        checkDate:   r.checkDate,
        remarks:     r.remarks,
        screenshotUrl: r.screenshotUrl,
        managerName: r.manager?.name,
        createdAt:   r.createdAt,
      };
      if (!seoMap[pid].latestReport) seoMap[pid].latestReport = entry;
      seoMap[pid].reports.push(entry);
    }

    result.seo = Object.values(seoMap);
  }

  return result;
};

