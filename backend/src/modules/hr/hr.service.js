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

// 🔹 Manager Services
exports.createManager = async (user, body) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  // Hash password only if provided
  let hashed;
  if (body.password) {
    hashed = await bcrypt.hash(body.password, 10);
  }

  // Check if calling user exists before connecting createdBy to avoid P2025
  const creator = user && user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;

  return prisma.user.create({
    data: {
      employeeId: body.employeeId || "MGR-" + Date.now(),
      name: body.name,
      email: body.email,
      ...(hashed && { password: hashed }),
      role: "MANAGER",
      ...(body.department && {
        department: {
          connectOrCreate: {
            where: { name: body.department },
            create: { name: body.department },
          },
        },
      }),
      ...(creator ? { createdBy: { connect: { id: creator.id } } } : {}),
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });
};

exports.getManagers = async (user) => {
  return prisma.user.findMany({
    where: {
      role: "MANAGER",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });
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
      department: true,
      createdAt: true,
    },
  });

  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return manager;
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

  //
  // 🔥 HASH PASSWORD
  //
  let hashedPassword;

  if (body.password) {
    hashedPassword = await bcrypt.hash(body.password, 10);
  }

  return prisma.user.update({
    where: { employeeId },

    data: {
      name: body.name,
      email: body.email,
      ...(body.department && {
        department: {
          connectOrCreate: {
            where: { name: body.department },
            create: { name: body.department },
          },
        },
      }),
      position: body.position,
      role: body.role,

      ...(hashedPassword && {
        password: hashedPassword,
      }),
    },

    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      createdAt: true,
    },
  });
};

exports.deleteManager = async (employeeId) => {
  const manager = await prisma.user.findUnique({ where: { employeeId } });

  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.delete({
    where: { employeeId },
  });
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
  const employee = await prisma.user.findUnique({ where: { employeeId } });

  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.delete({
    where: { employeeId },
  });
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
