const prisma = require("../../config/prisma");

exports.getEmployeeStats = async (userId) => {
  const assignments = await prisma.taskItemAssignment.findMany({
    where: { userId },
  });

  const totalTasks = assignments.length;
  const completedTasks = assignments.filter((a) => a.status === "COMPLETED" || a.status === "VERIFIED").length;
  
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    completionPercentage,
  };
};

exports.getAllEmployeesStats = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "MANAGER", "COORDINATOR"] }
    },
    include: {
      department: true,
      taskItemAssignments: true,
    }
  });

  const report = users.map((user) => {
    const totalTasks = user.taskItemAssignments.length;
    const completedTasks = user.taskItemAssignments.filter((a) => a.status === "COMPLETED" || a.status === "VERIFIED").length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      userId: user.id,
      employeeId: user.employeeId,
      name: user.name,
      department: user.department?.name || null,
      totalTasks,
      completedTasks,
      completionPercentage,
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
      };
    }
    
    projectsMap[projectName].totalTasks += 1;
    if (assignment.status === "COMPLETED" || assignment.status === "VERIFIED") {
      projectsMap[projectName].completedTasks += 1;
    }
  });

  const report = Object.values(projectsMap).map((proj) => ({
    ...proj,
    completionPercentage: proj.totalTasks > 0 ? Math.round((proj.completedTasks / proj.totalTasks) * 100) : 0,
  }));

  return report;
};
