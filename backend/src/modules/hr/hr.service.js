const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const parseArrayField = (value) => {
  if (value == null || value === "") return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [String(value)];
};

const serializeEmployeeRecord = (record) => {
  const departments =
    record.userDepartments?.map((item) => item.department) || [];
  const managers =
    record.employeeManagers?.map((item) => item.manager) || [];

  return {
    ...record,
    department: departments[0] || record.department || null,
    departments,
    manager: managers[0] || record.manager || null,
    managers,
    userDepartments: undefined,
    employeeManagers: undefined,
  };
};

const serializeManagerRecord = (record) => {
  const departments =
    record.userDepartments?.map((item) => item.department) || [];

  return {
    ...record,
    department: departments[0] || record.department || null,
    departments,
    userDepartments: undefined,
  };
};

// 🔹 Manager Services
exports.createManager = async (user, body) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  const departmentNames = parseArrayField(
    body.department || body.departments
  );

  if (departmentNames.length === 0) {
    throw new ApiError(400, "At least one department is required");
  }

  let hashed;
  if (body.password) {
    hashed = await bcrypt.hash(body.password, 10);
  }

  const creator = user && user.id
    ? await prisma.user.findUnique({ where: { id: user.id } })
    : null;

  const createdManager = await prisma.user.create({
    data: {
      employeeId: body.employeeId || "MGR-" + Date.now(),
      name: body.name,
      email: body.email,
      ...(hashed && { password: hashed }),
      role: "MANAGER",
      position: body.position || null,
      ...(creator ? { createdBy: { connect: { id: creator.id } } } : {}),
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const departmentRecords = await Promise.all(
    departmentNames.map(async (departmentName) => {
      return prisma.department.upsert({
        where: { name: departmentName },
        update: {},
        create: { name: departmentName },
      });
    })
  );

  await prisma.userDepartment.createMany({
    data: departmentRecords.map((department) => ({
      userId: createdManager.id,
      departmentId: department.id,
    })),
    skipDuplicates: true,
  });

  const manager = await prisma.user.findUnique({
    where: { id: createdManager.id },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return serializeManagerRecord(manager);
};

exports.getManagers = async (user) => {
  const managers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return managers.map(serializeManagerRecord);
};

exports.getManager = async (employeeId) => {
  const manager = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return serializeManagerRecord(manager);
};

exports.updateManager = async (employeeId, body) => {
  const manager = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  const departmentNames = parseArrayField(
    body.department || body.departments
  );

  const shouldUpdateDepartments =
    Object.prototype.hasOwnProperty.call(body, "department") ||
    Object.prototype.hasOwnProperty.call(body, "departments");

  if (shouldUpdateDepartments && departmentNames.length === 0) {
    throw new ApiError(400, "At least one department is required");
  }

  let hashedPassword;
  if (body.password) {
    hashedPassword = await bcrypt.hash(body.password, 10);
  }

  const updatedManager = await prisma.$transaction(async (tx) => {
    if (shouldUpdateDepartments) {
      await tx.userDepartment.deleteMany({
        where: { userId: manager.id },
      });

      const departmentRecords = await Promise.all(
        departmentNames.map(async (departmentName) => {
          return tx.department.upsert({
            where: { name: departmentName },
            update: {},
            create: { name: departmentName },
          });
        })
      );

      await tx.userDepartment.createMany({
        data: departmentRecords.map((department) => ({
          userId: manager.id,
          departmentId: department.id,
        })),
        skipDuplicates: true,
      });
    }

    return tx.user.update({
      where: { employeeId },
      data: {
        name: body.name,
        email: body.email,
        position: body.position,
        role: body.role,
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        position: true,
        createdAt: true,
        userDepartments: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  });

  return serializeManagerRecord(updatedManager);
};

exports.deleteManager = async (employeeId) => {
  const manager = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      role: true,
      name: true,
    },
  });

  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  try {
    // Use transaction to ensure all related data is deleted properly
    // Delete in order of dependencies to handle all foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user relationships first
      await tx.userDepartment.deleteMany({
        where: { userId: manager.id },
      });

      await tx.userManager.deleteMany({
        where: { employeeId: manager.id },
      });

      await tx.userManager.deleteMany({
        where: { managerId: manager.id },
      });

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId: manager.id },
      });

      // Delete task-related records
      await tx.taskItemAssignment.deleteMany({
        where: { userId: manager.id },
      });

      await tx.taskAssignment.deleteMany({
        where: { userId: manager.id },
      });

      await tx.taskEscalation.deleteMany({
        where: { employeeId: manager.id },
      });

      await tx.taskEscalation.deleteMany({
        where: { managerId: manager.id },
      });

      // Delete attendance records
      await tx.attendance.deleteMany({
        where: { userId: manager.id },
      });

      // Delete leave records (including where user is reviewer)
      await tx.leave.deleteMany({
        where: { reviewedBy: manager.id },
      });

      await tx.leave.deleteMany({
        where: { userId: manager.id },
      });

      // Delete coverage records
      await tx.employeeTaskCoverage.deleteMany({
        where: { employeeId: manager.id },
      });

      await tx.employeeTaskCoverage.deleteMany({
        where: { managerId: manager.id },
      });

      // Delete coordinator assignments
      await tx.coordinatorFollowUp.deleteMany({
        where: { senderId: manager.id },
      });

      await tx.coordinatorAssignment.deleteMany({
        where: { assignedToId: manager.id },
      });

      await tx.coordinatorAssignment.deleteMany({
        where: { createdById: manager.id },
      });

      // Delete project assignments
      await tx.projectAssignment.deleteMany({
        where: { managerId: manager.id },
      });

      // Delete shoot workspace memberships
      await tx.shootSubTask.deleteMany({
        where: { submittedById: manager.id },
      });

      await tx.shootTask.deleteMany({
        where: { createdById: manager.id },
      });

      // Delete project-related records
      await tx.projectMonthlySheet.deleteMany({
        where: { createdById: manager.id },
      });

      await tx.project.deleteMany({
        where: { createdById: manager.id },
      });

      // Delete tasks created by this user
      await tx.task.deleteMany({
        where: { createdById: manager.id },
      });

      // Delete the user
      await tx.user.delete({
        where: { id: manager.id },
      });
    });

    return { id: manager.id, employeeId: manager.employeeId };
  } catch (err) {
    throw new ApiError(500, {
      code: "DELETE_ERROR",
      message: `Failed to delete manager: ${err.message}`,
    });
  }
};

// exports.createEmployee = async (user, body) => {
//   // 🔹 Check duplicate email
//   const existingUser = await prisma.user.findUnique({
//     where: { email: body.email },
//   });

//   if (existingUser) {
//     throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
//   }

//   // 🔹 If managerId is provided → validate manager exists
//   let manager = null;
//   if (body.managerId) {
//     // 🔥 Look up by employeeId (not id)
//     manager = await prisma.user.findUnique({
//       where: { employeeId: body.managerId },
//     });

//     if (!manager) {
//       throw new ApiError(404, "Manager not found");
//     }

//     if (manager.role !== "MANAGER") {
//       throw new ApiError(400, "Assigned user is not a manager");
//     }

//     // 🔥 Use manager's UUID id for the relation
//     body.managerId = manager.id;
//   }

//   const hashed = await bcrypt.hash(body.password, 10);

//   const newUser = await prisma.user.create({
//     data: {
//       employeeId: body.employeeId || "EMP-" + Date.now(),
//       name: body.name,
//       email: body.email,
//       password: hashed,

//       role: body.role,
//       department: body.department,
//       position: body.position,

//       managerId: body.managerId || null, // 👈 NEW
//       createdById: user.id,
//     },
//     select: {
//       id: true,
//       employeeId: true,
//       name: true,
//       email: true,
//       role: true,
//       department: true,
//       position: true,
//       managerId: true,
//       createdAt: true,
//     },
//   });

//   return newUser;
// };

exports.createEmployee = async (user, body) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  const departmentNames = parseArrayField(body.department || body.departments);
  const managerIds = parseArrayField(body.managerId || body.managerIds);

  if (departmentNames.length === 0) {
    throw new ApiError(400, "At least one department is required");
  }

  for (const managerId of managerIds) {
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new ApiError(404, ERRORS.HR.MANAGER_NOT_FOUND);
    }

    if (manager.role !== "MANAGER") {
      throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
    }
  }

  let hashed;
  if (body.password) {
    hashed = await bcrypt.hash(body.password, 10);
  }

  const creator = user && user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;

  const createdUser = await prisma.user.create({
    data: {
      employeeId: body.employeeId || "EMP-" + Date.now(),
      name: body.name,
      email: body.email,
      ...(hashed && { password: hashed }),
      role: body.role,
      position: body.position,
      ...(creator ? { createdBy: { connect: { id: creator.id } } } : {}),
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
    },
  });

  const departmentRecords = await Promise.all(
    departmentNames.map(async (departmentName) => {
      return prisma.department.upsert({
        where: { name: departmentName },
        update: {},
        create: { name: departmentName },
      });
    })
  );

  await prisma.userDepartment.createMany({
    data: departmentRecords.map((department) => ({
      userId: createdUser.id,
      departmentId: department.id,
    })),
    skipDuplicates: true,
  });

  await prisma.userManager.createMany({
    data: managerIds.map((managerId) => ({
      employeeId: createdUser.id,
      managerId,
    })),
    skipDuplicates: true,
  });

  const employee = await prisma.user.findUnique({
    where: { id: createdUser.id },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      employeeManagers: {
        select: {
          manager: {
            select: {
              id: true,
              employeeId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return serializeEmployeeRecord(employee);
};

exports.getEmployees = async (user) => {
  const employees = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      employeeManagers: {
        select: {
          manager: {
            select: {
              id: true,
              employeeId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return employees.map(serializeEmployeeRecord);
};

exports.getEmployee = async (employeeId) => {
  const employee = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      createdAt: true,
      userDepartments: {
        select: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      employeeManagers: {
        select: {
          manager: {
            select: {
              id: true,
              employeeId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return serializeEmployeeRecord(employee);
};

// exports.updateEmployee = async (employeeId, body) => {
//   const employee = await prisma.user.findUnique({ where: { employeeId } });

//   if (!employee) {
//     throw new ApiError(404, ERRORS.USER.NOT_FOUND);
//   }

//   if (employee.role !== "EMPLOYEE") {
//     throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
//   }

//   return prisma.user.update({
//     where: { employeeId },
//     data: body,
//     select: {
//       id: true,
//       employeeId: true,
//       name: true,
//       email: true,
//       role: true,
//       department: true,
//       position: true,
//       managerId: true,
//       createdAt: true,
//     },
//   });
// };

exports.updateEmployee = async (employeeId, body) => {
  const employee = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (employee.role !== "EMPLOYEE") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  const departmentNames = parseArrayField(
    body.department || body.departments
  );
  const managerIds = parseArrayField(body.managerId || body.managerIds);

  if (
    Object.prototype.hasOwnProperty.call(body, "department") ||
    Object.prototype.hasOwnProperty.call(body, "departments")
  ) {
    if (departmentNames.length === 0) {
      throw new ApiError(400, "At least one department is required");
    }
  }

  for (const managerId of managerIds) {
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new ApiError(404, ERRORS.HR.MANAGER_NOT_FOUND);
    }

    if (manager.role !== "MANAGER") {
      throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
    }
  }

  let hashedPassword;
  if (body.password) {
    hashedPassword = await bcrypt.hash(body.password, 10);
  }

  const shouldUpdateDepartments =
    Object.prototype.hasOwnProperty.call(body, "department") ||
    Object.prototype.hasOwnProperty.call(body, "departments");

  const shouldUpdateManagers =
    Object.prototype.hasOwnProperty.call(body, "managerId") ||
    Object.prototype.hasOwnProperty.call(body, "managerIds");

  const updatedEmployee = await prisma.$transaction(async (tx) => {
    if (shouldUpdateDepartments) {
      await tx.userDepartment.deleteMany({
        where: { userId: employee.id },
      });

      if (departmentNames.length > 0) {
        const departments = await Promise.all(
          departmentNames.map(async (departmentName) => {
            return tx.department.upsert({
              where: { name: departmentName },
              update: {},
              create: { name: departmentName },
            });
          })
        );

        await tx.userDepartment.createMany({
          data: departments.map((department) => ({
            userId: employee.id,
            departmentId: department.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    if (shouldUpdateManagers) {
      await tx.userManager.deleteMany({
        where: { employeeId: employee.id },
      });

      if (managerIds.length > 0) {
        await tx.userManager.createMany({
          data: managerIds.map((managerId) => ({
            employeeId: employee.id,
            managerId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return tx.user.update({
      where: { employeeId },
      data: {
        name: body.name,
        email: body.email,
        position: body.position,
        role: body.role,
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        position: true,
        createdAt: true,
        userDepartments: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        employeeManagers: {
          select: {
            manager: {
              select: {
                id: true,
                employeeId: true,
                name: true,
              },
            },
          },
        },
      },
    });
  });

  return serializeEmployeeRecord(updatedEmployee);
};

exports.deleteEmployee = async (employeeId) => {
  const employee = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      role: true,
      name: true,
    },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  // Allow deletion of EMPLOYEE and MANAGER roles
  if (!["EMPLOYEE", "MANAGER", "EA", "COORDINATOR"].includes(employee.role)) {
    throw new ApiError(400, {
      code: "INVALID_ROLE",
      message: `Cannot delete user with role ${employee.role}`,
    });
  }

  try {
    // Use transaction to ensure all related data is deleted properly
    // Delete in order of dependencies to handle all foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user relationships first
      await tx.userDepartment.deleteMany({
        where: { userId: employee.id },
      });

      await tx.userManager.deleteMany({
        where: { employeeId: employee.id },
      });

      await tx.userManager.deleteMany({
        where: { managerId: employee.id },
      });

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId: employee.id },
      });

      // Delete task-related records
      await tx.taskItemAssignment.deleteMany({
        where: { userId: employee.id },
      });

      await tx.taskAssignment.deleteMany({
        where: { userId: employee.id },
      });

      await tx.taskEscalation.deleteMany({
        where: { employeeId: employee.id },
      });

      await tx.taskEscalation.deleteMany({
        where: { managerId: employee.id },
      });

      // Delete attendance records
      await tx.attendance.deleteMany({
        where: { userId: employee.id },
      });

      // Delete leave records (including where user is reviewer)
      await tx.leave.deleteMany({
        where: { reviewedBy: employee.id },
      });

      await tx.leave.deleteMany({
        where: { userId: employee.id },
      });

      // Delete coverage records
      await tx.employeeTaskCoverage.deleteMany({
        where: { employeeId: employee.id },
      });

      await tx.employeeTaskCoverage.deleteMany({
        where: { managerId: employee.id },
      });

      // Delete coordinator assignments
      await tx.coordinatorFollowUp.deleteMany({
        where: { senderId: employee.id },
      });

      await tx.coordinatorAssignment.deleteMany({
        where: { assignedToId: employee.id },
      });

      await tx.coordinatorAssignment.deleteMany({
        where: { createdById: employee.id },
      });

      // Delete project assignments
      await tx.projectAssignment.deleteMany({
        where: { managerId: employee.id },
      });

      // Delete shoot workspace memberships
      await tx.shootSubTask.deleteMany({
        where: { submittedById: employee.id },
      });

      await tx.shootTask.deleteMany({
        where: { createdById: employee.id },
      });

      // Delete project-related records
      await tx.projectMonthlySheet.deleteMany({
        where: { createdById: employee.id },
      });

      await tx.project.deleteMany({
        where: { createdById: employee.id },
      });

      // Delete tasks created by this user
      await tx.task.deleteMany({
        where: { createdById: employee.id },
      });

      // Delete the user
      await tx.user.delete({
        where: { id: employee.id },
      });
    });

    return { id: employee.id, employeeId: employee.employeeId };
  } catch (err) {
    throw new ApiError(500, {
      code: "DELETE_ERROR",
      message: `Failed to delete employee: ${err.message}`,
    });
  }
};

// Get Employee Attandance

exports.getEmployeeAttendance = async (employeeId, query) => {
  const { from, to } = query;

  // 🔹 Check employee exists
  const employee = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.HR.EMPLOYEE_NOT_FOUND);
  }

  const where = {
    userId: employee.id,
  };

  if (from && to) {
    where.date = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  return prisma.attendance.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      breaks: true,
    },
  });
};

// Get Employee Summary

exports.getEmployeeAttendanceSummary = async (employeeId) => {
  const employee = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.HR.EMPLOYEE_NOT_FOUND);
  }

  const records = await prisma.attendance.findMany({
    where: { userId: employee.id },
  });

  let present = 0;
  let halfDay = 0;
  let absent = 0;
  let holiday = 0;

  records.forEach((r) => {
    if (r.status === "PRESENT") present++;
    else if (r.status === "HALF_DAY") halfDay++;
    else if (r.status === "ABSENT") absent++;
    else if (r.status === "HOLIDAY") holiday++;
  });

  return {
    employeeId,
    totalDays: records.length,
    present,
    halfDay,
    absent,
    holiday,
  };
};

// 🔹 GET ALL LEAVES
// exports.getAllLeaves = async () => {
//   return prisma.leave.findMany({
//     include: {
//       user: {
//         select: {
//           name: true,
//           employeeId: true,
//           department: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// };

// // 🔹 APPROVE / REJECT
// // exports.updateLeaveStatus = async (leaveId, hrId, body) => {
// //   const { status, reviewNote } = body;

// //   const leave = await prisma.leave.findUnique({
// //     where: { id: leaveId },
// //   });

// //   if (!leave) {
// //     throw new ApiError(404, "Leave not found");
// //   }

// //   if (leave.status !== "PENDING") {
// //     throw new ApiError(400, "Leave already processed");
// //   }

// //   // ❗ require note if rejected
// //   if (status === "REJECTED" && !reviewNote) {
// //     throw new ApiError(400, "Rejection reason is required");
// //   }

// //   return prisma.leave.update({
// //     where: { id: leaveId },
// //     data: {
// //       status,
// //       reviewNote,
// //       reviewedBy: hrId,
// //     },
// //   });
// // };

// exports.updateLeaveStatus = async (leaveId, hrId, body) => {
//   const { status, reviewNote } = body;

//   if (!["APPROVED", "REJECTED"].includes(status)) {
//     throw new ApiError(400, "Invalid status");
//   }

//   const leave = await prisma.leave.findUnique({
//     where: { id: leaveId },
//   });

//   if (!leave) {
//     throw new ApiError(404, "Leave not found");
//   }

//   if (leave.status !== "PENDING") {
//     throw new ApiError(400, "Leave already processed");
//   }

//   // ❗ require note if rejected
//   if (status === "REJECTED" && !reviewNote) {
//     throw new ApiError(400, "Rejection reason is required");
//   }

//   // 🔥 IF APPROVED → DO IMPORTANT THINGS
//   if (status === "APPROVED") {
//     const year = new Date(leave.startDate).getFullYear();

//     let balance = await prisma.leaveBalance.findUnique({
//       where: {
//         userId_year: {
//           userId: leave.userId,
//           year,
//         },
//       },
//     });

//     if (!balance) {
//       balance = await prisma.leaveBalance.create({
//         data: {
//           userId: leave.userId,
//           year,
//         },
//       });
//     }

//     // 🔥 CHECK BALANCE AGAIN (important safety)
//     if (leave.type === "CASUAL") {
//       if (balance.casual - balance.usedCasual < leave.days) {
//         throw new ApiError(400, "Not enough casual leave balance");
//       }
//     }

//     if (leave.type === "SICK") {
//       if (balance.sick - balance.usedSick < leave.days) {
//         throw new ApiError(400, "Not enough sick leave balance");
//       }
//     }

//     // 🔥 UPDATE BALANCE
//     await prisma.leaveBalance.update({
//       where: { id: balance.id },
//       data:
//         leave.type === "CASUAL"
//           ? { usedCasual: { increment: leave.days } }
//           : { usedSick: { increment: leave.days } },
//     });

//     // 🔥 UPDATE ATTENDANCE (VERY IMPORTANT)
//     const dates = [];
//     let current = new Date(leave.startDate);

//     while (current <= new Date(leave.endDate)) {
//       dates.push(new Date(current));
//       current.setDate(current.getDate() + 1);
//     }

//     for (const date of dates) {
//       await prisma.attendance.upsert({
//         where: {
//           userId_date: {
//             userId: leave.userId,
//             date,
//           },
//         },
//         update: {
//           status: "LEAVE",
//         },
//         create: {
//           userId: leave.userId,
//           date,
//           status: "LEAVE",
//         },
//       });
//     }
//   }

//   // 🔥 FINAL UPDATE
//   return prisma.leave.update({
//     where: { id: leaveId },
//     data: {
//       status,
//       reviewNote,
//       reviewedBy: hrId,
//     },
//   });
// };

// // 🔹 EMPLOYEE LEAVE SUMMARY
// // exports.getEmployeeLeaveSummary = async (employeeId) => {
// //   const user = await prisma.user.findUnique({
// //     where: { employeeId },
// //   });

// //   if (!user) {
// //     throw new ApiError(404, "Employee not found");
// //   }

// //   const leaves = await prisma.leave.findMany({
// //     where: { userId: user.id },
// //   });

// //   let approved = 0;
// //   let pending = 0;
// //   let rejected = 0;

// //   leaves.forEach((l) => {
// //     if (l.status === "APPROVED") approved++;
// //     else if (l.status === "PENDING") pending++;
// //     else if (l.status === "REJECTED") rejected++;
// //   });

// //   return {
// //     totalLeaves: leaves.length,
// //     approved,
// //     pending,
// //     rejected,
// //   };
// // };

// exports.getEmployeeLeaveSummary = async (employeeId) => {
//   const user = await prisma.user.findUnique({
//     where: { employeeId },
//   });

//   if (!user) {
//     throw new ApiError(404, "Employee not found");
//   }

//   const leaves = await prisma.leave.findMany({
//     where: { userId: user.id },
//   });

//   const balance = await prisma.leaveBalance.findFirst({
//     where: { userId: user.id },
//     orderBy: { year: "desc" },
//   });

//   return {
//     totalLeaves: leaves.length,
//     approved: leaves.filter(l => l.status === "APPROVED").length,
//     pending: leaves.filter(l => l.status === "PENDING").length,
//     rejected: leaves.filter(l => l.status === "REJECTED").length,

//     // 🔥 ADD THIS
//     balance: balance
//       ? {
//           casualLeft: balance.casual - balance.usedCasual,
//           sickLeft: balance.sick - balance.usedSick,
//         }
//       : null,
//   };
// };

// 🔹 normalize date (IMPORTANT)
const normalizeDate = (d) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};

// 🔹 GET ALL LEAVES
exports.getAllLeaves = async () => {
  return prisma.leave.findMany({
    include: {
      user: {
        select: {
          name: true,
          employeeId: true,
          department: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// 🔹 APPROVE / REJECT LEAVE
exports.updateLeaveStatus = async (leaveId, hrId, body) => {
  const { status, reviewNote } = body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new ApiError(400, ERRORS.LEAVE.INVALID_STATUS);
  }

  // 🔥 SECURITY CHECK: Verify HR user exists and has HR role
  const hrUser = await prisma.user.findUnique({
    where: { id: hrId },
  });

  if (!hrUser || hrUser.role !== "HR") {
    throw new ApiError(403, ERRORS.AUTH.HR_ONLY);
  }

  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
  });

  if (!leave) {
    throw new ApiError(404, ERRORS.LEAVE.NOT_FOUND);
  }

  if (leave.status !== "PENDING") {
    throw new ApiError(400, ERRORS.LEAVE.ALREADY_PROCESSED);
  }

  // ❗ require note if rejected
  if (status === "REJECTED" && !reviewNote) {
    throw new ApiError(400, ERRORS.LEAVE.REJECTION_REASON_REQUIRED);
  }

  // 🔥 IF APPROVED
  if (status === "APPROVED") {
    const year = new Date(leave.startDate).getFullYear();

    let balance = await prisma.leaveBalance.findUnique({
      where: {
        userId_year: {
          userId: leave.userId,
          year,
        },
      },
    });

    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: {
          userId: leave.userId,
          year,
        },
      });
    }

    // 🔥 SAFETY CHECK
    if (leave.type === "CASUAL") {
      if (balance.casual - balance.usedCasual < leave.days) {
        throw new ApiError(400, ERRORS.LEAVE.INSUFFICIENT_BALANCE);
      }
    }

    if (leave.type === "SICK") {
      if (balance.sick - balance.usedSick < leave.days) {
        throw new ApiError(400, ERRORS.LEAVE.INSUFFICIENT_BALANCE);
      }
    }

    // 🔥 UPDATE BALANCE
    await prisma.leaveBalance.update({
      where: { id: balance.id },
      data:
        leave.type === "CASUAL"
          ? { usedCasual: { increment: leave.days } }
          : { usedSick: { increment: leave.days } },
    });

    // 🔥 UPDATE ATTENDANCE (OPTIMIZED)
    const dates = [];
    let current = new Date(leave.startDate);

    while (current <= new Date(leave.endDate)) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    await prisma.$transaction(
      dates.map((date) =>
        prisma.attendance.upsert({
          where: {
            userId_date: {
              userId: leave.userId,
              date: normalizeDate(date),
            },
          },
          update: {
            status: "LEAVE",
          },
          create: {
            userId: leave.userId,
            date: normalizeDate(date),
            status: "LEAVE",
          },
        }),
      ),
    );
  }

  // 🔥 FINAL UPDATE
  return prisma.leave.update({
    where: { id: leaveId },
    data: {
      status,
      reviewNote,
      reviewedBy: hrId,
    },
    include: {
      user: {
        select: {
          name: true,
          employeeId: true,
        },
      },
    },
  });
};

// 🔹 EMPLOYEE LEAVE SUMMARY
exports.getEmployeeLeaveSummary = async (employeeId) => {
  const user = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!user) {
    throw new ApiError(404, "Employee not found");
  }

  const leaves = await prisma.leave.findMany({
    where: { userId: user.id },
  });

  const balance = await prisma.leaveBalance.findFirst({
    where: { userId: user.id },
    orderBy: { year: "desc" },
  });

  return {
    totalLeaves: leaves.length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,

    balance: balance
      ? {
          casualLeft: balance.casual - balance.usedCasual,
          sickLeft: balance.sick - balance.usedSick,
        }
      : null,
  };
};

// 🔥 HR DASHBOARD OVERVIEW - COMPREHENSIVE MONITORING
exports.getDashboardOverview = async () => {
  // Get all managers
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER" },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      department: true,
      createdAt: true,
    },
  });

  // Build comprehensive overview for each manager
  const overview = await Promise.all(
    managers.map(async (manager) => {
      // Get manager's employees
      const employees = await prisma.user.findMany({
        where: {
          managerId: manager.id,
          role: "EMPLOYEE",
        },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          department: true,
        },
      });

      // Get manager's tasks
      const tasks = await prisma.task.findMany({
        where: {
          createdById: manager.id,
        },
        select: {
          id: true,
          description: true,
          status: true,
          createdAt: true,
          projectName: true,
        },
      });

      // Get task assignments for this manager's tasks
      const taskAssignments = await prisma.taskAssignment.findMany({
        where: {
          task: {
            createdById: manager.id,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      // Get task items created by this manager's tasks
      const taskItems = await prisma.taskItem.findMany({
        where: {
          task: {
            createdById: manager.id,
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
        },
      });

      // Get all task item assignments for this manager's team
      const assignments = await prisma.taskItemAssignment.findMany({
        where: {
          userId: {
            in: employees.map((e) => e.id),
          },
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
            },
          },
          taskItem: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      // Calculate statistics
      const completedAssignments = assignments.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const pendingAssignments = assignments.filter(
        (a) => a.status === "PENDING"
      ).length;
      const submittedAssignments = assignments.filter(
        (a) => a.status === "SUBMITTED"
      ).length;
      const rejectedAssignments = assignments.filter(
        (a) => a.status === "REJECTED"
      ).length;

      const averageProgress =
        assignments.length > 0
          ? Math.round(
              assignments.reduce((sum, a) => sum + (a.progress || 0), 0) /
                assignments.length
            )
          : 0;

      // Group assignments by employee for quick lookup
      const assignmentsByEmployee = {};
      employees.forEach((emp) => {
        assignmentsByEmployee[emp.id] = assignments.filter(
          (a) => a.userId === emp.id
        );
      });

      return {
        manager: manager,
        stats: {
          totalEmployees: employees.length,
          totalTasks: tasks.length,
          totalTaskItems: taskItems.length,
          totalAssignments: assignments.length,
          completedAssignments: completedAssignments,
          pendingAssignments: pendingAssignments,
          submittedAssignments: submittedAssignments,
          rejectedAssignments: rejectedAssignments,
          averageProgress: averageProgress,
          completionRate:
            assignments.length > 0
              ? Math.round(
                  (completedAssignments / assignments.length) * 100
                )
              : 0,
        },
        employees: employees.map((emp) => ({
          ...emp,
          assignedTasks: assignmentsByEmployee[emp.id].length,
          completedTasks: assignmentsByEmployee[emp.id].filter(
            (a) => a.status === "COMPLETED"
          ).length,
          pendingTasks: assignmentsByEmployee[emp.id].filter(
            (a) => a.status === "PENDING"
          ).length,
          submittedTasks: assignmentsByEmployee[emp.id].filter(
            (a) => a.status === "SUBMITTED"
          ).length,
          averageProgress:
            assignmentsByEmployee[emp.id].length > 0
              ? Math.round(
                  assignmentsByEmployee[emp.id].reduce(
                    (sum, a) => sum + (a.progress || 0),
                    0
                  ) / assignmentsByEmployee[emp.id].length
                )
              : 0,
        })),
        tasks: tasks.map((task) => {
          const taskItemsForTask = taskItems.filter((ti) => ti.taskId === task.id);
          return {
            ...task,
            itemCount: taskItemsForTask.length,
          };
        }),
        recentAssignments: assignments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
          .map((a) => ({
            id: a.id,
            employee: a.employee,
            taskItem: a.taskItem,
            status: a.status,
            progress: a.progress || 0,
            createdAt: a.createdAt,
            submittedAt: a.submittedAt,
            rejectionReason: a.rejectionReason,
          })),
      };
    })
  );

  // Calculate global statistics
  const totalManagers = managers.length;
  const totalEmployees = await prisma.user.count({
    where: { role: "EMPLOYEE" },
  });
  const totalTasks = await prisma.task.count();
  const totalTaskItems = await prisma.taskItem.count();
  const allAssignments = await prisma.taskItemAssignment.findMany({
    select: {
      status: true,
      progress: true,
    },
  });

  const globalStats = {
    totalManagers,
    totalEmployees,
    totalTasks,
    totalTaskItems,
    totalAssignments: allAssignments.length,
    completedAssignments: allAssignments.filter(
      (a) => a.status === "COMPLETED"
    ).length,
    pendingAssignments: allAssignments.filter((a) => a.status === "PENDING")
      .length,
    submittedAssignments: allAssignments.filter((a) => a.status === "SUBMITTED")
      .length,
    rejectedAssignments: allAssignments.filter((a) => a.status === "REJECTED")
      .length,
    globalAverageProgress:
      allAssignments.length > 0
        ? Math.round(
            allAssignments.reduce((sum, a) => sum + (a.progress || 0), 0) /
              allAssignments.length
          )
        : 0,
    globalCompletionRate:
      allAssignments.length > 0
        ? Math.round(
            (allAssignments.filter((a) => a.status === "COMPLETED").length /
              allAssignments.length) *
              100
          )
        : 0,
  };

  return {
    globalStats,
    managerDetails: overview,
  };
};

// 🔥 ADMIN - FULL DASHBOARD OVERVIEW
exports.getAdminDashboardOverview = async () => {
  const [
    totalManagers,
    totalEmployees,
    totalProjects,
    totalTasks,
    totalTaskItems,
    totalTaskAssignments,
    totalTaskItemAssignments,
    totalMonthlySheets,
    totalMonthlySheetDays,
    totalShootSubTasks,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "MANAGER" } }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.project.count(),
    prisma.task.count(),
    prisma.taskItem.count(),
    prisma.taskAssignment.count(),
    prisma.taskItemAssignment.count(),
    prisma.projectMonthlySheet.count(),
    prisma.projectMonthlySheetDay.count(),
    prisma.shootSubTask.count(),
  ]);

  const assignmentStats = await prisma.taskItemAssignment.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const monthlySheets = await prisma.projectMonthlySheet.findMany({
    select: {
      id: true,
      projectId: true,
      month: true,
      year: true,
      totalReels: true,
      totalPosts: true,
      totalReelsUploaded: true,
      totalPostsUploaded: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      department: true,
      employeeManagers: {
        select: {
          manager: {
            select: {
              id: true,
              employeeId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const assignmentSummary = assignmentStats.reduce(
    (summary, row) => {
      summary[row.status.toLowerCase()] = row._count.status;
      return summary;
    },
    {
      completed: 0,
      pending: 0,
      submitted: 0,
      rejected: 0,
    }
  );

  const employeeProgress = await Promise.all(
    employees.map(async (employee) => {
      const assignments = await prisma.taskItemAssignment.findMany({
        where: { userId: employee.id },
        select: {
          status: true,
          progress: true,
        },
      });

      const completed = assignments.filter((a) => a.status === "COMPLETED").length;
      const pending = assignments.filter((a) => a.status === "PENDING").length;
      const submitted = assignments.filter((a) => a.status === "SUBMITTED").length;
      const rejected = assignments.filter((a) => a.status === "REJECTED").length;
      const averageProgress =
        assignments.length > 0
          ? Math.round(
              assignments.reduce((sum, a) => sum + (a.progress || 0), 0) /
                assignments.length
            )
          : 0;

      return {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        manager: employee.employeeManagers[0]?.manager || null,
        assignmentStats: {
          total: assignments.length,
          completed,
          pending,
          submitted,
          rejected,
          averageProgress,
        },
      };
    })
  );

  return {
    counts: {
      totalManagers,
      totalEmployees,
      totalProjects,
      totalTasks,
      totalTaskItems,
      totalTaskAssignments,
      totalTaskItemAssignments,
      totalMonthlySheets,
      totalMonthlySheetDays,
      totalShootSubTasks,
    },
    assignmentSummary,
    monthlySheets,
    employeeProgress,
  };
};

exports.getAdminDashboardProjects = async () => {
  const projects = await prisma.project.findMany({
    include: {
      department: true,
      createdBy: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignments: {
        include: {
          manager: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
              position: true,
            },
          },
        },
      },
      monthlySheets: {
        include: {
          createdBy: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
            },
          },
          days: {
            include: {
              shootSubTasks: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  submissionLinks: true,
                  reviewedAt: true,
                  reviewedBy: {
                    select: {
                      id: true,
                      employeeId: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => ({
    id: project.id,
    projectName: project.projectName,
    description: project.description,
    department: project.department,
    startDate: project.startDate,
    endDate: project.endDate,
    renewalDate: project.renewalDate,
    frequency: project.frequency,
    clientName: project.clientName,
    location: project.location,
    createdBy: project.createdBy,
    managers: project.assignments.map((assignment) => assignment.manager),
    monthlySheets: project.monthlySheets.map((sheet) => ({
      id: sheet.id,
      month: sheet.month,
      year: sheet.year,
      totalReels: sheet.totalReels,
      totalPosts: sheet.totalPosts,
      totalReelsUploaded: sheet.totalReelsUploaded,
      totalPostsUploaded: sheet.totalPostsUploaded,
      moodBoardLink: sheet.moodBoardLink,
      createdBy: sheet.createdBy,
      days: sheet.days.map((day) => ({
        id: day.id,
        date: day.date,
        title: day.title,
        reelType: day.reelType,
        postType: day.postType,
        videoType: day.videoType,
        referenceLinks: day.referenceLinks,
        submissionLinks: day.submissionLinks,
        script: day.script,
        description: day.description,
        shootSubTasks: day.shootSubTasks,
      })),
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));
};

exports.getAdminEmployeeProgress = async () => {
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      department: true,
      employeeManagers: {
        select: {
          manager: {
            select: {
              id: true,
              employeeId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return Promise.all(
    employees.map(async (employee) => {
      const assignments = await prisma.taskItemAssignment.findMany({
        where: { userId: employee.id },
        include: {
          taskItem: {
            select: {
              id: true,
              title: true,
              status: true,
              task: {
                select: {
                  id: true,
                  projectName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const completed = assignments.filter((a) => a.status === "COMPLETED").length;
      const pending = assignments.filter((a) => a.status === "PENDING").length;
      const submitted = assignments.filter((a) => a.status === "SUBMITTED").length;
      const rejected = assignments.filter((a) => a.status === "REJECTED").length;
      const averageProgress =
        assignments.length > 0
          ? Math.round(
              assignments.reduce((sum, a) => sum + (a.progress || 0), 0) /
                assignments.length
            )
          : 0;

      return {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        manager: employee.employeeManagers[0]?.manager || null,
        assignmentStats: {
          total: assignments.length,
          completed,
          pending,
          submitted,
          rejected,
          averageProgress,
        },
        assignments: assignments.map((assignment) => ({
          id: assignment.id,
          status: assignment.status,
          progress: assignment.progress,
          taskItem: assignment.taskItem,
        })),
      };
    })
  );
};

exports.getAdminTaskAllocations = async () => {
  const taskAssignments = await prisma.taskAssignment.findMany({
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
        },
      },
      task: {
        select: {
          id: true,
          projectName: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const taskItemAssignments = await prisma.taskItemAssignment.findMany({
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
        },
      },
      taskItem: {
        select: {
          id: true,
          title: true,
          status: true,
          task: {
            select: {
              id: true,
              projectName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    taskAssignments,
    taskItemAssignments,
  };
};

exports.getAdminMonthlySheets = async () => {
  const sheets = await prisma.projectMonthlySheet.findMany({
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
          department: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
        },
      },
      days: {
        include: {
          shootSubTasks: {
            include: {
              reviewedBy: {
                select: {
                  id: true,
                  employeeId: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return sheets.map((sheet) => ({
    id: sheet.id,
    project: sheet.project,
    month: sheet.month,
    year: sheet.year,
    totalReels: sheet.totalReels,
    totalPosts: sheet.totalPosts,
    totalReelsUploaded: sheet.totalReelsUploaded,
    totalPostsUploaded: sheet.totalPostsUploaded,
    moodBoardLink: sheet.moodBoardLink,
    createdBy: sheet.createdBy,
    days: sheet.days.map((day) => ({
      id: day.id,
      date: day.date,
      title: day.title,
      reelType: day.reelType,
      postType: day.postType,
      videoType: day.videoType,
      referenceLinks: day.referenceLinks,
      submissionLinks: day.submissionLinks,
      script: day.script,
      description: day.description,
      shootSubTasks: day.shootSubTasks.map((subTask) => ({
        id: subTask.id,
        title: subTask.title,
        status: subTask.status,
        submissionLinks: subTask.submissionLinks,
        reviewedBy: subTask.reviewedBy,
        reviewedAt: subTask.reviewedAt,
      })),
      createdAt: day.createdAt,
      updatedAt: day.updatedAt,
    })),
    createdAt: sheet.createdAt,
    updatedAt: sheet.updatedAt,
  }));
};
