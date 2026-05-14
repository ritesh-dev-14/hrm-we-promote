// const prisma = require("../../config/prisma");

// exports.getManagerTaskTracker =
//   async (user) => {

//     //
//     // 🔥 FIND TASKS ASSIGNED TO MANAGER
//     //
//     const assignments =
//       await prisma.taskAssignment.findMany({
//         where: {
//           userId: user.id,
//         },

//         select: {
//           taskId: true,
//         },
//       });

//     const taskIds =
//       assignments.map(
//         (a) => a.taskId
//       );

//     //
//     // 🔥 GET TASK ITEM ASSIGNMENTS
//     //
//     const items =
//       await prisma.taskItemAssignment.findMany({
//         where: {
//           taskItem: {
//             taskId: {
//               in: taskIds,
//             },
//           },
//         },

//         include: {
//           employee: {
//             select: {
//               id: true,
//               employeeId: true,
//               name: true,
//               role: true,
//             },
//           },

//           taskItem: {
//             include: {
//               task: {
//                 select: {
//                   id: true,
//                   title: true,
//                 },
//               },
//             },
//           },

//           submission: true,
//         },

//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//     //
//     // 🔥 FORMAT RESPONSE
//     //
//     return items.map((item) => ({
//       assignmentId: item.id,

//       taskTitle:
//         item.taskItem.task.title,

//       taskItemTitle:
//         item.taskItem.title,

//       employee: item.employee,

//       progress:
//         item.progress,

//       status:
//         item.status,

//       startedAt:
//         item.startedAt,

//       submittedAt:
//         item.submittedAt,

//       completedAt:
//         item.completedAt,

//       verifiedAt:
//         item.verifiedAt,

//       submission:
//         item.submission,
//     }));
//   };

const prisma = require("../../config/prisma");

exports.getManagerTaskTracker =
  async (user) => {

    //
    // 🔥 FIND TASKS ASSIGNED TO MANAGER
    //
    // 🔥 GET TASK ITEM ASSIGNMENTS for manager's team or tasks created by manager
    const items =
      await prisma.taskItemAssignment.findMany({
        where: {
          OR: [
            { employee: { managerId: user.id } },
            { taskItem: { task: { createdById: user.id } } },
          ],
        },

        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              role: true,
              department: true,
              position: true,
            },
          },

          taskItem: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  date: true,
                },
              },
            },
          },

          submission: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    //
    // 🔥 DASHBOARD SUMMARY
    //
    const summary = {

      totalAssignments:
        items.length,

      completed:
        items.filter(
          (i) =>
            i.status ===
            "COMPLETED"
        ).length,

      inProgress:
        items.filter(
          (i) =>
            i.status ===
            "IN_PROGRESS"
        ).length,

      pending:
        items.filter(
          (i) =>
            i.status ===
            "PENDING"
        ).length,

      submitted:
        items.filter(
          (i) =>
            i.status ===
            "SUBMITTED"
        ).length,

      rejected:
        items.filter(
          (i) =>
            i.status ===
            "REJECTED"
        ).length,
    };

    //
    // 🔥 EMPLOYEE WISE TRACKING
    //
    const employeeMap = {};

    for (const item of items) {

      const empId =
        item.employee.id;

      //
      // CREATE EMPLOYEE
      //
      if (!employeeMap[empId]) {

        employeeMap[empId] = {

          employee: {
            id:
              item.employee.id,

            employeeId:
              item.employee.employeeId,

            name:
              item.employee.name,

            role:
              item.employee.role,

            department:
              item.employee.department,

            position:
              item.employee.position,
          },

          totalTasks: 0,

          completedTasks: 0,

          pendingTasks: 0,

          inProgressTasks: 0,

          submittedTasks: 0,

          rejectedTasks: 0,

          overallProgress: 0,

          taskItems: [],
        };
      }

      //
      // COUNTS
      //
      employeeMap[
        empId
      ].totalTasks += 1;

      if (
        item.status ===
        "COMPLETED"
      ) {
        employeeMap[
          empId
        ].completedTasks += 1;
      }

      if (
        item.status ===
        "PENDING"
      ) {
        employeeMap[
          empId
        ].pendingTasks += 1;
      }

      if (
        item.status ===
        "IN_PROGRESS"
      ) {
        employeeMap[
          empId
        ].inProgressTasks += 1;
      }

      if (
        item.status ===
        "SUBMITTED"
      ) {
        employeeMap[
          empId
        ].submittedTasks += 1;
      }

      if (
        item.status ===
        "REJECTED"
      ) {
        employeeMap[
          empId
        ].rejectedTasks += 1;
      }

      //
      // TASK ITEM
      //
      employeeMap[
        empId
      ].taskItems.push({

        assignmentId:
          item.id,

        taskId:
          item.taskItem.task.id,

        taskTitle:
          item.taskItem.task.title,

        taskStatus:
          item.taskItem.task.status,

        taskDate:
          item.taskItem.task.date,

        taskItemId:
          item.taskItem.id,

        taskItemTitle:
          item.taskItem.title,

        progress:
          item.progress,

        status:
          item.status,

        startedAt:
          item.startedAt,

        submittedAt:
          item.submittedAt,

        completedAt:
          item.completedAt,

        verifiedAt:
          item.verifiedAt,

        rejectionReason:
          item.rejectionReason,

        submission:
          item.submission
            ? {
                id:
                  item.submission.id,

                driveLink:
                  item.submission.driveLink,

                remarks:
                  item.submission.remarks,

                verifiedByManager:
                  item.submission.verifiedByManager,
              }
            : null,
      });
    }

    //
    // 🔥 CALCULATE EMPLOYEE PROGRESS
    //
    const employees =
      Object.values(employeeMap)
        .map((emp) => {

          const totalProgress =
            emp.taskItems.reduce(
              (sum, t) =>
                sum +
                (t.progress || 0),
              0
            );

          emp.overallProgress =
            emp.taskItems.length > 0
              ? Math.round(
                  totalProgress /
                  emp.taskItems.length
                )
              : 0;

          return emp;
        });

    //
    // 🔥 FINAL RESPONSE
    //
    return {
      summary,

      employees,
    };
  };