const prisma = require("../../config/prisma");

/**
 * Get Pending Client Approvals (Upgrade 7)
 */
exports.getPendingApprovals = async (req, res, next) => {
  try {
    // Find all TaskItems that are VERIFIED but NOT clientApproved
    const pendingItems = await prisma.taskItem.findMany({
      where: {
        status: "VERIFIED",
        clientApproved: false
      },
      include: {
        task: {
          select: {
            projectName: true,
            projectId: true,
            project: {
              select: {
                clientName: true,
                department: {
                  select: { name: true }
                }
              }
            }
          }
        },
        assignments: {
          where: {
            status: "VERIFIED"
          },
          select: {
            verifiedAt: true
          },
          take: 1,
          orderBy: { verifiedAt: "desc" }
        }
      }
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Format data and calculate days waiting
    const approvals = pendingItems.map(item => {
      // Find when it was verified. Fallback to updated at or created at.
      let verifiedDate = null;
      if (item.assignments && item.assignments.length > 0 && item.assignments[0].verifiedAt) {
        verifiedDate = new Date(item.assignments[0].verifiedAt);
      } else {
        verifiedDate = new Date(item.createdAt);
      }
      
      const vDateOnly = new Date(verifiedDate);
      vDateOnly.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(now - vDateOnly);
      const daysWaiting = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: item.id,
        title: item.title,
        projectName: item.task?.projectName || "Unknown",
        clientName: item.task?.project?.clientName || "Unknown",
        departmentName: item.task?.project?.department?.name || "Unknown",
        mediaType: item.mediaType,
        verifiedAt: verifiedDate,
        daysWaiting: daysWaiting,
        isOverdue: daysWaiting > 3 // Alert badge for >3 days
      };
    });

    // Group by Project
    const grouped = approvals.reduce((acc, curr) => {
      if (!acc[curr.projectName]) {
        acc[curr.projectName] = {
          projectName: curr.projectName,
          clientName: curr.clientName,
          departmentName: curr.departmentName,
          items: []
        };
      }
      acc[curr.projectName].items.push(curr);
      return acc;
    }, {});

    // Convert object to array and sort by worst waiting time
    const groupedArray = Object.values(grouped).map(group => {
      group.items.sort((a, b) => b.daysWaiting - a.daysWaiting);
      group.maxDaysWaiting = Math.max(...group.items.map(i => i.daysWaiting));
      group.hasOverdue = group.items.some(i => i.isOverdue);
      return group;
    });

    groupedArray.sort((a, b) => b.maxDaysWaiting - a.maxDaysWaiting);

    res.json({ success: true, data: { grouped: groupedArray, total: approvals.length } });
  } catch (err) {
    next(err);
  }
};
