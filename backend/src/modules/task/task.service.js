const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

// 🔹 CREATE TASK
exports.createTask = async (user, body) => {
  if (user.role !== "MANAGER") {
    throw new ApiError(403, ERRORS.AUTH.UNAUTHORIZED);
  }

  return prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      location: body.location,
      setupType: body.setupType,
      managerId: user.id,
    },
  });
};

// 🔹 ASSIGN TASK
exports.assignTask = async (user, taskId, body) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new ApiError(404, ERRORS.TASK.NOT_FOUND);
  }

  if (task.managerId !== user.id) {
    throw new ApiError(403, ERRORS.AUTH.UNAUTHORIZED);
  }

  // 🔥 Check duplicate assignment
  const employeeIds = body.assignments.map(a => a.employeeId);
  const uniqueIds = new Set(employeeIds);

  if (uniqueIds.size !== employeeIds.length) {
    throw new ApiError(400, ERRORS.TASK.DUPLICATE_ASSIGNMENT);
  }

  // 🔥 Check employees exist
  const employees = await prisma.user.findMany({
    where: {
      employeeId: { in: employeeIds },
      role: "EMPLOYEE",
    },
  });

  if (employees.length !== employeeIds.length) {
    throw new ApiError(400, ERRORS.TASK.EMPLOYEE_NOT_FOUND);
  }

  // 🔥 Create assignments
  const data = body.assignments.map((a) => {
    const emp = employees.find(e => e.employeeId === a.employeeId);

    return {
      taskId,
      employeeId: emp.id,
      groupId: a.groupId || null,
    };
  });

  await prisma.taskAssignment.createMany({
    data,
    skipDuplicates: true,
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "ASSIGNED" },
  });

  return { message: "Task assigned successfully" };
};

// 🔹 GET TASKS
// exports.getTasks = async (user) => {
//   const tasks = await prisma.task.findMany({
//     where: { managerId: user.id },
//     include: {
//       assignments: {
//         include: {
//           employee: {
//             select: {
//               employeeId: true,
//               name: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: { date: "asc" },
//   });

//   return tasks.map(task => {
//     const groups = {};
//     const individuals = [];

//     task.assignments.forEach(a => {
//       if (a.groupId) {
//         if (!groups[a.groupId]) {
//           groups[a.groupId] = [];
//         }
//         groups[a.groupId].push(a.employee);
//       } else {
//         individuals.push(a.employee);
//       }
//     });

//     return {
//       id: task.id,
//       title: task.title,
//       date: task.date,
//       status: task.status,
//       totalEmployees: task.assignments.length,
//       groups: Object.keys(groups).map(gid => ({
//         groupId: gid,
//         members: groups[gid],
//       })),
//       individuals,
//     };
//   });
// };

exports.getTasks = async (user) => {
  const tasks = await prisma.task.findMany({
    where: { managerId: user.id },
    include: {
      assignments: {
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              name: true
            }
          }
        }
      }
    }
  });

  return tasks.map(task => {
    const groupsMap = {};
    const individuals = [];

    task.assignments.forEach(a => {
      const emp = {
        employeeId: a.employee.employeeId,
        name: a.employee.name
      };

      if (a.groupId) {
        if (!groupsMap[a.groupId]) {
          groupsMap[a.groupId] = {
            groupId: a.groupId,
            members: []
          };
        }
        groupsMap[a.groupId].members.push(emp);
      } else {
        individuals.push(emp);
      }
    });

    return {
      id: task.id,
      title: task.title,
      date: task.date,
      status: task.status,
      totalEmployees: task.assignments.length,
      groups: Object.values(groupsMap),
      individuals
    };
  });
};