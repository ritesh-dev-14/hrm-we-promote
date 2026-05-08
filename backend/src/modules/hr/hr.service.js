const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

// 🔹 Manager Services
exports.createManager = async (user, body) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  const hashed = await bcrypt.hash(body.password, 10);

  return prisma.user.create({
    data: {
      employeeId: body.employeeId || "MGR-" + Date.now(),
      name: body.name,
      email: body.email,
      password: hashed,
      role: "MANAGER",
      department: body.department,
      createdById: user.id,
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
  const manager = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return prisma.user.update({
    where: { employeeId },
    data: body,
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

exports.deleteManager = async (employeeId) => {
  const manager = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!manager) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return prisma.user.delete({
    where: { employeeId },
  });
};

exports.createEmployee = async (user, body) => {
  // 🔹 Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
  }

  // 🔹 If managerId is provided → validate manager exists
  let manager = null;
  if (body.managerId) {
    // 🔥 Look up by employeeId (not id)
    manager = await prisma.user.findUnique({
      where: { employeeId: body.managerId },
    });

    if (!manager) {
      throw new ApiError(404, "Manager not found");
    }

    if (manager.role !== "MANAGER") {
      throw new ApiError(400, "Assigned user is not a manager");
    }
    
    // 🔥 Use manager's UUID id for the relation
    body.managerId = manager.id;
  }

  const hashed = await bcrypt.hash(body.password, 10);

  const newUser = await prisma.user.create({
    data: {
      employeeId: body.employeeId || "EMP-" + Date.now(),
      name: body.name,
      email: body.email,
      password: hashed,

      role: body.role,
      department: body.department,
      position: body.position,

      managerId: body.managerId || null, // 👈 NEW
      createdById: user.id,
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      createdAt: true,
    },
  });

  return newUser;
};

exports.getEmployees = async (user) => {
  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      manager: {
        select: {
          name: true
        }
      },
      createdAt: true,
    },
  });
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
      department: true,
      position: true,
      managerId: true,
      manager: {
        select: {
          name: true
        }
      },
      createdAt: true,
    },
  });

  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  return employee;
};

exports.updateEmployee = async (employeeId, body) => {
  const employee = await prisma.user.findUnique({ where: { employeeId } });
  
  if (!employee) {
    throw new ApiError(404, ERRORS.USER.NOT_FOUND);
  }

  if (employee.role !== "EMPLOYEE") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }

  return prisma.user.update({
    where: { employeeId },
    data: body,
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      position: true,
      managerId: true,
      createdAt: true,
    },
  });
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
    throw new ApiError(404, "Employee not found");
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
    throw new ApiError(404, "Employee not found");
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
    throw new ApiError(400, "Invalid status");
  }

  // 🔥 SECURITY CHECK: Verify HR user exists and has HR role
  const hrUser = await prisma.user.findUnique({
    where: { id: hrId },
  });

  if (!hrUser || hrUser.role !== "HR") {
    throw new ApiError(403, "Unauthorized: Only HR can approve/reject leaves");
  }

  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
  });

  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }

  if (leave.status !== "PENDING") {
    throw new ApiError(400, "Leave already processed");
  }

  // ❗ require note if rejected
  if (status === "REJECTED" && !reviewNote) {
    throw new ApiError(400, "Rejection reason is required");
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
        throw new ApiError(400, "Not enough casual leave balance");
      }
    }

    if (leave.type === "SICK") {
      if (balance.sick - balance.usedSick < leave.days) {
        throw new ApiError(400, "Not enough sick leave balance");
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
        })
      )
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
    approved: leaves.filter(l => l.status === "APPROVED").length,
    pending: leaves.filter(l => l.status === "PENDING").length,
    rejected: leaves.filter(l => l.status === "REJECTED").length,

    balance: balance
      ? {
          casualLeft: balance.casual - balance.usedCasual,
          sickLeft: balance.sick - balance.usedSick,
        }
      : null,
  };
};