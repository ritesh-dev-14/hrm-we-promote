const prisma = require("../../config/prisma");

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
