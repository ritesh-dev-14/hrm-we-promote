const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE TASK
//
exports.createTask = async (user, body) => {
  //
  // ✅ ONLY ADMIN / HR / MANAGER
  //
  if (!["ADMIN", "HR", "MANAGER"].includes(user.role)) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  //
  // ✅ MANAGER CAN CREATE TASK ONLY FOR HIMSELF
  //
  // Task creator itself becomes owner of task.
  // HR can create for herself/manager later via assignment.
  //

  const task = await prisma.task.create({
    data: {
      projectName: body.projectName,
      description: body.description || null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      createdById: user.id,
      status: "DRAFT",
    },
  });

  // Return a minimal task object — omit fields we don't want to expose
  return {
    id: task.id,
    projectName: task.projectName,
    description: task.description || null,
    startDate: task.startDate,
    endDate: task.endDate,
    createdById: task.createdById,
    status: task.status,
    createdAt: task.createdAt,
    progress: 0,
  };
};

//
// 🔥 ASSIGN MAIN TASK
//
// RULES:
//
// HR:
// - can assign to MANAGER
// - can assign to herself
//
// MANAGER:
// - can assign ONLY to himself
//
// EMPLOYEE:
// - cannot receive MAIN TASK
// - employees receive TASK ITEMS only
//
exports.assignTask = async (
  user,
  taskId,
  body
) => {
  //
  // ✅ FIND TASK
  //
  const task =
    await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

  if (!task) {
    throw new ApiError(
      404,
      ERRORS.TASK.NOT_FOUND
    );
  }

  // NOTE: normally only the task creator can assign. However,
  // allow a MANAGER to self-assign a task to themselves even if
  // they are not the creator (use-case: manager accepts a task).
  // We'll enforce this more granularly after resolving employee ids.

  //
  // ✅ GET EMPLOYEE IDS
  //
  const employeeIds =
    body.assignments.map(
      (a) => a.employeeId
    );

  //
  // ✅ CHECK DUPLICATES
  //
  const uniqueIds =
    new Set(employeeIds);

  if (
    uniqueIds.size !==
    employeeIds.length
  ) {
    throw new ApiError(
      400,
      ERRORS.TASK
        .DUPLICATE_ASSIGNMENT
    );
  }

  //
  // ✅ FIND USERS
  //
  const employees =
    await prisma.user.findMany({
      where: {
        employeeId: {
          in: employeeIds,
        },
      },
    });

  //
  // ✅ VALIDATE USERS
  //
  if (
    employees.length !==
    employeeIds.length
  ) {
    throw new ApiError(
      400,
      ERRORS.TASK
        .EMPLOYEE_NOT_FOUND
    );
  }

  // ✅ AUTHORIZATION: allow only the task creator to assign,
  // except permit a MANAGER to self-assign to themselves
  // (use-case: manager accepts a task). Any other non-creator
  // attempts are denied.
  const isCreator = task.createdById === user.id;
  const isManagerSelfAssign =
    user.role === "MANAGER" &&
    employees.length === 1 &&
    employees[0].id === user.id;

  if (!isCreator && !isManagerSelfAssign) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  //
  // ✅ ROLE-BASED RULES
  //
  employees.forEach((emp) => {
    //
    // 🔥 MANAGER
    //
    if (user.role === "MANAGER") {
      //
      // Manager can assign
      // ONLY to himself
      //
      const allowed =
        emp.id === user.id;

      if (!allowed) {
        throw new ApiError(
          403,
          "Manager can assign main task only to himself"
        );
      }
    }

    //
    // 🔥 HR
    //
    else if (
      user.role === "HR"
    ) {
      //
      // HR can assign ONLY:
      // - MANAGER
      // - herself
      //
      const allowed =
        emp.role ===
          "MANAGER" ||
        emp.id === user.id;

      if (!allowed) {
        throw new ApiError(
          403,
          `HR cannot assign main task to ${emp.role}`
        );
      }
    }

    //
    // 🔥 ADMIN
    //
    else if (
      user.role === "ADMIN"
    ) {
      //
      // Admin can assign to:
      // - HR
      // - MANAGER
      //
      if (
        ![
          "HR",
          "MANAGER",
        ].includes(emp.role)
      ) {
        throw new ApiError(
          403,
          `Admin cannot assign main task to ${emp.role}`
        );
      }
    }

    //
    // ❌ EMPLOYEE CANNOT RECEIVE MAIN TASK
    //
    if (
      emp.role === "EMPLOYEE"
    ) {
      throw new ApiError(
        403,
        "Employees cannot receive main tasks. Create task items for employees."
      );
    }
  });

  //
  // ✅ CREATE ASSIGNMENTS
  //
  const assignments =
    body.assignments.map(
      (a) => {
        const emp =
          employees.find(
            (e) =>
              e.employeeId ===
              a.employeeId
          );

        return {
          taskId: task.id,

          userId: emp.id,

          workDate: a.workDate
            ? new Date(a.workDate)
            : task.startDate
            ? new Date(task.startDate)
            : new Date(),
        };
      }
    );

  await prisma.taskAssignment.createMany(
    {
      data: assignments,

      skipDuplicates: true,
    }
  );

  //
  // ✅ UPDATE TASK STATUS
  //
  await prisma.task.update({
    where: {
      id: taskId,
    },

    data: {
      status: "ASSIGNED",
    },
  });

  //
  // ✅ SEND NOTIFICATIONS
  //
  await prisma.notification.createMany(
    {
      data: employees.map(
        (emp) => ({
          userId: emp.id,

          title:
            "New Main Task Assigned",

          message: `You have been assigned main task: ${task.projectName}`,

          type:
            "TASK_ASSIGNED",

          level: "INFO",

          entityId: task.id,
        })
      ),
    }
  );

  return {
    success: true,

    message:
      "Main task assigned successfully",
  };
};

//
// 🔥 GET SINGLE TASK
//
exports.getTaskById = async (
  user,
  taskId
) => {
  const task =
    await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
          },
        },

        assignments: {
          include: {
            employee: {
              select: {
                id: true,

                employeeId: true,

                name: true,

                role: true,
              },
            },

            submission: true,
          },
        },

        items: true,
      },
    });

  if (!task) {
    throw new ApiError(
      404,
      ERRORS.TASK.NOT_FOUND
    );
  }

  //
  // ✅ ACCESS RULES
  //
  const isCreator =
    task.createdById === user.id;

  const isAdmin =
    user.role === "ADMIN";

  const assignment =
    await prisma.taskAssignment.findFirst(
      {
        where: {
          taskId: task.id,

          userId: user.id,
        },
      }
    );

  const isAssigned =
    !!assignment;

  if (
    !isCreator &&
    !isAssigned &&
    !isAdmin
  ) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  return task;
};

//
// 🔥 GET MY ASSIGNED TASKS
//
exports.getMyAssignedTasks =
  async (user) => {
    const whereClause = {
      userId: user.id,
    };

    //
    // ✅ MANAGER
    // show tasks assigned by HR
    //
    if (
      user.role ===
      "MANAGER"
    ) {
      whereClause.task = {
        createdBy: {
          role: "HR",
        },
      };
    }

    //
    // ✅ HR
    // show tasks assigned by ADMIN
    //
    if (
      user.role === "HR"
    ) {
      whereClause.task = {
        createdBy: {
          role: "ADMIN",
        },
      };
    }

    const assignments =
      await prisma.taskAssignment.findMany(
        {
          where: whereClause,

          include: {
            task: {
              include: {
                createdBy: {
                  select: {
                    id: true,

                    employeeId: true,

                    name: true,

                    role: true,
                  },
                },

                items: true,
              },
            },

            submission: true,

            taskGroup: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        }
      );

    return assignments.map(
      (a) => ({
        assignmentId: a.id,

        status: a.status,

        progress:
          a.progress || 0,

        submitted:
          !!a.submission,

        startedAt:
          a.startedAt,

        submittedAt:
          a.submittedAt,

        verifiedAt:
          a.verifiedAt,

        completedAt:
          a.completedAt,

        rejectedAt:
          a.rejectedAt,

        rejectionReason:
          a.rejectionReason,

        taskGroup:
          a.taskGroup
            ? {
                id:
                  a.taskGroup.id,

                name:
                  a.taskGroup
                    .name,
              }
            : null,

        task: {
          id: a.task.id,

          title:
            a.task.title,

          description:
            a.task.description,

          instructions:
            a.task
              .instructions,

          referenceLink:
            a.task
              .referenceLink,

          date: a.task.date,

          location:
            a.task.location,

          setupType:
            a.task
              .setupType,

          status:
            a.task.status,

          totalItems:
            a.task.items
              .length,

          createdBy:
            a.task
              .createdBy,
        },
      })
    );
  };

//
// 🔥 UPDATE TASK ASSIGNMENT STATUS
//
exports.updateTaskAssignmentStatus =
  async (
    user,
    assignmentId,
    body
  ) => {
    const assignment =
      await prisma.taskAssignment.findUnique(
        {
          where: {
            id: assignmentId,
          },

          include: {
            task: true,
          },
        }
      );

    if (!assignment) {
      throw new ApiError(
        404,
        "Assignment not found"
      );
    }

    //
    // ✅ ONLY ASSIGNED USER
    //
    if (
      assignment.userId !==
      user.id
    ) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    const updateData = {
      status: body.status,
    };

    //
    // ✅ PROGRESS
    //
    if (
      body.progress !==
      undefined
    ) {
      updateData.progress =
        body.progress;
    }

    //
    // ✅ STATUS LOGIC
    //
    if (
      body.status ===
      "IN_PROGRESS"
    ) {
      updateData.startedAt =
        new Date();
    }

    if (
      body.status ===
      "SUBMITTED"
    ) {
      updateData.submittedAt =
        new Date();

      updateData.progress = 100;
    }

    if (
      body.status ===
      "VERIFIED"
    ) {
      updateData.verifiedAt =
        new Date();
    }

    if (
      body.status ===
      "COMPLETED"
    ) {
      updateData.completedAt =
        new Date();

      updateData.progress = 100;
    }

    if (
      body.status ===
      "REJECTED"
    ) {
      updateData.rejectedAt =
        new Date();

      updateData.rejectionReason =
        body.rejectionReason ||
        null;
    }

    //
    // ✅ UPDATE ASSIGNMENT
    //
    const updated =
      await prisma.taskAssignment.update(
        {
          where: {
            id: assignmentId,
          },

          data: updateData,
        }
      );

    //
    // ✅ UPDATE MAIN TASK STATUS
    //
    const allAssignments =
      await prisma.taskAssignment.findMany(
        {
          where: {
            taskId:
              assignment.taskId,
          },
        }
      );

    const statuses =
      allAssignments.map(
        (a) => a.status
      );

    let taskStatus =
      "PENDING";

    if (
      statuses.every(
        (s) =>
          s ===
          "COMPLETED"
      )
    ) {
      taskStatus =
        "COMPLETED";
    } else if (
      statuses.some(
        (s) =>
          s ===
          "IN_PROGRESS"
      )
    ) {
      taskStatus =
        "IN_PROGRESS";
    } else if (
      statuses.some(
        (s) =>
          s ===
          "SUBMITTED"
      )
    ) {
      taskStatus =
        "SUBMITTED";
    } else if (
      statuses.some(
        (s) =>
          s ===
          "VERIFIED"
      )
    ) {
      taskStatus =
        "VERIFIED";
    }

    await prisma.task.update({
      where: {
        id: assignment.taskId,
      },

      data: {
        status: taskStatus,
      },
    });

    return updated;
  };

//
// 🔥 GET ALL TASKS
//
exports.getTasks = async (
  user
) => {
  const tasks =
    await prisma.task.findMany({
      where: {
        OR: [
          {
            createdById:
              user.id,
          },

          {
            assignments: {
              some: {
                userId:
                  user.id,
              },
            },
          },
        ],
      },

      include: {
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
          },
        },

        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                role: true,
              },
            },
          },
        },

        items: {
          include: {
            assignments: true,
          },
        },
      },

      orderBy: {
        startDate: "asc",
      },
    });

  return tasks.map((task) => {
    const submittedItemsCount = (task.items || []).reduce((sum, item) => {
      const isSubmitted =
        (item.assignments || []).some(
          (a) => a.status === "SUBMITTED" || a.status === "UNABLE_TO_SUBMIT"
        ) || item.status === "SUBMITTED" || item.status === "UNABLE_TO_SUBMIT";
      return sum + (isSubmitted ? 1 : 0);
    }, 0);

    const submittedAssignmentsCount = (task.assignments || []).filter(
      (a) => a.status === "SUBMITTED" || a.status === "UNABLE_TO_SUBMIT"
    ).length;

    const totalPendingSubmissions = Math.max(submittedItemsCount, submittedAssignmentsCount);

    return {
      id: task.id,
      projectName: task.projectName,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
      createdAt: task.createdAt,
      createdBy: task.createdBy,
      assignments: task.assignments.map((a) => ({
        userId: a.userId,
        employee: a.employee,
        status: a.status,
        progress: a.progress || 0,
      })),
      totalItems: task.items.length,
      submittedItemsCount: totalPendingSubmissions,
    };
  });
};

//
// ======================================================
// 🔥 GET TASK ITEMS WITH ALL DETAILS (For Manager)
// ======================================================
//
exports.getTaskItemsWithDetails =
  async (
    user,
    taskId
  ) => {

    //
    // ✅ FIND TASK
    //
    const task =
      await prisma.task.findUnique({
        where: {
          id: taskId,
        },

        include: {
          createdBy: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              role: true,
            },
          },
        },
      });

    if (!task) {
      throw new ApiError(
        404,
        ERRORS.TASK.NOT_FOUND
      );
    }

    //
    // ✅ ACCESS CONTROL
    // (Manager/HR/Admin only)
    //
    const isCreator =
      task.createdById === user.id;

    const isManager =
      user.role === "MANAGER";

    const isAdmin =
      user.role === "ADMIN";

    const isHR =
      user.role === "HR";

    const hasAccess =
      isCreator || isAdmin || 
      isManager || isHR;

    if (!hasAccess) {
      throw new ApiError(
        403,
        ERRORS.AUTH.ACCESS_DENIED
      );
    }

    //
    // ✅ GET ALL TASK ITEMS
    //
    const taskItems =
      await prisma.taskItem.findMany({
        where: {
          taskId,
        },

        include: {
          assignments: {
            include: {
              employee: {
                select: {
                  id: true,
                  employeeId: true,
                  name: true,
                  email: true,
                  role: true,
                  position: true,
                },
              },

              submission: {
                select: {
                  id: true,
                  driveLink: true,
                  remarks: true,
                  unableToSubmitReason:
                    true,
                  submittedAt: true,
                  verifiedByManager:
                    true,
                },
              },
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },

        orderBy: {
          order: "asc",
        },
      });

    //
    // ✅ FORMAT RESPONSE
    //
    return {
      task: {
        id: task.id,
        projectName:
          task.projectName,
        description:
          task.description,
        startDate:
          task.startDate,
        endDate:
          task.endDate,
        status:
          task.status,
        progress:
          task.progress,
        createdAt:
          task.createdAt,
        createdBy:
          task.createdBy,
      },

      summary: {
        totalItems:
          taskItems.length,

        totalAssignments:
          taskItems.reduce(
            (sum, item) =>
              sum +
              item.assignments
                .length,
            0
          ),

        submittedCount:
          taskItems.reduce(
            (sum, item) =>
              sum +
              item.assignments.filter(
                (a) =>
                  a.status ===
                  "SUBMITTED"
              ).length,
            0
          ),

        verifiedCount:
          taskItems.reduce(
            (sum, item) =>
              sum +
              item.assignments.filter(
                (a) =>
                  a.status ===
                  "VERIFIED"
              ).length,
            0
          ),

        rejectedCount:
          taskItems.reduce(
            (sum, item) =>
              sum +
              item.assignments.filter(
                (a) =>
                  a.status ===
                  "REJECTED"
              ).length,
            0
          ),

        unableToSubmitCount:
          taskItems.reduce(
            (sum, item) =>
              sum +
              item.assignments.filter(
                (a) =>
                  a.status ===
                  "UNABLE_TO_SUBMIT"
              ).length,
            0
          ),
      },

      items: taskItems.map(
        (item) => ({
          id: item.id,
          title: item.title,
          referenceLink: item.referenceLink,
          rawDataLink: item.rawDataLink,
          description:
            item.description,
          status:
            item.status,
          progress:
            item.progress,
          priority:
            item.priority,
          dueDate:
            item.dueDate,
          createdAt:
            item.createdAt,

          assignments:
            item.assignments.map(
              (a) => ({
                assignmentId:
                  a.id,

                employee: {
                  id: a.employee.id,
                  employeeId:
                    a.employee
                      .employeeId,
                  name:
                    a.employee.name,
                  email:
                    a.employee.email,
                  role:
                    a.employee.role,
                  position:
                    a.employee
                      .position,
                },

                status:
                  a.status,

                progress:
                  a.progress || 0,

                startedAt:
                  a.startedAt,

                submittedAt:
                  a.submittedAt,

                verifiedAt:
                  a.verifiedAt,

                completedAt:
                  a.completedAt,

                rejectedAt:
                  a.rejectedAt,

                rejectionReason:
                  a.rejectionReason,

                submission: a.submission
                  ? {
                      id: a.submission
                        .id,

                      driveLink:
                        a.submission
                          .driveLink,

                      remarks:
                        a.submission
                          .remarks,

                      unableToSubmitReason:
                        a.submission
                          .unableToSubmitReason,

                      submittedAt:
                        a.submission
                          .submittedAt,

                      verifiedByManager:
                        a.submission
                          .verifiedByManager,
                    }
                  : null,
              })
            ),
        })
      ),
    };
  };