const express = require("express");
const { PrismaClient } = require("@prisma/client");
const escalationService = require("../../services/escalationService");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

//
// 🔥 GET ALL PENDING ESCALATIONS FOR CURRENT USER
// 
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get escalations where user is manager or is HR/Admin
    const escalations = await prisma.taskEscalation.findMany({
      where: {
        OR: [
          { managerId: userId }, // User is the manager
          {
            manager: {
              role: { in: ["HR", "ADMIN"] },
            },
          }, // User is HR or Admin
        ],
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
          },
        },
      },
      orderBy: { escalationDate: "desc" },
    });

    res.json({
      success: true,
      count: escalations.length,
      data: escalations,
    });
  } catch (error) {
    console.error("Error fetching escalations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch escalations",
      error: error.message,
    });
  }
});

//
// 🔥 GET ESCALATION HISTORY FOR SPECIFIC MANAGER
//
router.get("/manager/:managerId/history", authMiddleware, async (req, res) => {
  try {
    const { managerId } = req.params;

    // Check if user has permission to view
    if (req.user.role !== "ADMIN" && req.user.role !== "HR" && req.user.id !== managerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const escalations = await prisma.taskEscalation.findMany({
      where: { managerId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: escalations.length,
      data: escalations,
    });
  } catch (error) {
    console.error("Error fetching manager escalations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager escalations",
      error: error.message,
    });
  }
});

//
// 🔥 GET ESCALATION STATISTICS
//
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Only HR and Admin can view stats
    if (!["HR", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only HR and Admin can view escalation statistics",
      });
    }

    const stats = {
      total: await prisma.taskEscalation.count(),
      pending: await prisma.taskEscalation.count({
        where: { status: "PENDING" },
      }),
      managerNotified: await prisma.taskEscalation.count({
        where: { status: "MANAGER_NOTIFIED" },
      }),
      hrEscalated: await prisma.taskEscalation.count({
        where: { status: "HR_ESCALATED" },
      }),
      adminEscalated: await prisma.taskEscalation.count({
        where: { status: "ADMIN_ESCALATED" },
      }),
      finalEscalated: await prisma.taskEscalation.count({
        where: { status: "FINAL_ESCALATED" },
      }),
      resolved: await prisma.taskEscalation.count({
        where: { status: "RESOLVED" },
      }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching escalation stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch escalation statistics",
      error: error.message,
    });
  }
});

//
// 🔥 MARK ESCALATION AS RESOLVED (When manager finally assigns task)
//
router.post("/:escalationId/resolve", authMiddleware, async (req, res) => {
  try {
    const { escalationId } = req.params;

    const escalation = await prisma.taskEscalation.findUnique({
      where: { id: escalationId },
      include: {
        manager: true,
      },
    });

    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: "Escalation not found",
      });
    }

    // Only manager or admin can resolve
    if (
      req.user.id !== escalation.managerId &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updated = await escalationService.updateEscalationStatus(
      escalationId,
      "RESOLVED",
      {
        resolvedAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Escalation resolved successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error resolving escalation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve escalation",
      error: error.message,
    });
  }
});

//
// 🔥 CHECK MISSING TASKS MANUALLY (For testing or manual trigger)
//
router.post("/check/manual", authMiddleware, async (req, res) => {
  try {
    // Only Admin can trigger manual check
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can trigger manual checks",
      });
    }

    await escalationService.checkMissingTaskAssignments();

    res.json({
      success: true,
      message: "Manual task assignment check completed",
    });
  } catch (error) {
    console.error("Error in manual check:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform manual check",
      error: error.message,
    });
  }
});

//
// 🔥 GET ESCALATION DETAIL
//
router.get("/:escalationId", authMiddleware, async (req, res) => {
  try {
    const { escalationId } = req.params;

    const escalation = await prisma.taskEscalation.findUnique({
      where: { id: escalationId },
      include: {
        employee: true,
        manager: true,
      },
    });

    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: "Escalation not found",
      });
    }

    res.json({
      success: true,
      data: escalation,
    });
  } catch (error) {
    console.error("Error fetching escalation detail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch escalation",
      error: error.message,
    });
  }
});

module.exports = router;
