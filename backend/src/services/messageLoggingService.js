const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ERRORS = require('../utils/errors');

/**
 * Log a sent or failed WhatsApp message to the database
 * @param {object} messageData - {projectId, managerId, clientPhoneNumber, messageContent, status, messageId?, failureReason?, templateId?}
 * @returns {Promise<object>} - Created WhatsappMessage record
 */
exports.logMessage = async (messageData) => {
  try {
    const {
      projectId,
      managerId,
      clientPhoneNumber,
      messageContent,
      status = 'PENDING',
      messageId = null,
      failureReason = null,
      templateId = null,
    } = messageData;

    // Validate required fields
    if (!projectId || !managerId || !clientPhoneNumber || !messageContent) {
      throw new ApiError(400, {
        code: 'INVALID_MESSAGE_DATA',
        message: 'Missing required fields: projectId, managerId, clientPhoneNumber, messageContent',
      });
    }

    // Create WhatsappMessage record
    const message = await prisma.whatsappMessage.create({
      data: {
        projectId,
        managerId,
        clientPhoneNumber,
        messageContent,
        status,
        messageId,
        failureReason,
        templateId,
        sentAt: status === 'SENT' || status === 'DELIVERED' ? new Date() : null,
      },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            phone: true,
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
    });

    console.log(`WhatsApp message logged: ID=${message.id}, Status=${status}, Project=${projectId}`);
    return message;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('Error in logMessage:', error);
    throw new ApiError(500, {
      code: ERRORS.INTERNAL.DATABASE_ERROR.code,
      message: `Failed to log WhatsApp message: ${error.message}`,
    });
  }
};

/**
 * Update message status (e.g., PENDING -> SENT -> DELIVERED)
 * @param {string} messageId - WhatsappMessage ID
 * @param {string} status - New status (SENT, DELIVERED, FAILED)
 * @param {string} metaMessageId - Meta WhatsApp message ID (optional)
 * @param {string} failureReason - Failure reason if status is FAILED
 * @returns {Promise<object>} - Updated WhatsappMessage record
 */
exports.updateMessageStatus = async (
  messageId,
  status,
  metaMessageId = null,
  failureReason = null
) => {
  try {
    if (!messageId || !status) {
      throw new ApiError(400, {
        code: 'INVALID_INPUT',
        message: 'messageId and status are required',
      });
    }

    const updateData = {
      status,
    };

    if (metaMessageId) {
      updateData.messageId = metaMessageId;
    }

    if (status === 'SENT' || status === 'DELIVERED') {
      updateData.sentAt = new Date();
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    const updated = await prisma.whatsappMessage.update({
      where: { id: messageId },
      data: updateData,
      include: {
        project: {
          select: { projectName: true },
        },
        manager: {
          select: { name: true },
        },
      },
    });

    console.log(`WhatsApp message status updated: ID=${messageId}, Status=${status}`);
    return updated;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.code === 'P2025') {
      throw new ApiError(404, {
        code: 'MESSAGE_NOT_FOUND',
        message: `WhatsApp message with ID ${messageId} not found`,
      });
    }

    console.error('Error in updateMessageStatus:', error);
    throw new ApiError(500, {
      code: ERRORS.INTERNAL.DATABASE_ERROR.code,
      message: `Failed to update message status: ${error.message}`,
    });
  }
};

/**
 * Get messages with filters - role-based access control
 * @param {object} filters - {projectId?, dateFrom?, dateTo?, status?, managerId?, userId?, userRole?}
 * @param {number} limit - Number of records to return
 * @param {number} offset - Pagination offset
 * @returns {Promise<{messages: Array, total: number, limit: number, offset: number}>}
 */
exports.getMessages = async (
  filters = {},
  limit = 50,
  offset = 0
) => {
  try {
    const {
      projectId,
      dateFrom,
      dateTo,
      status,
      managerId,
      userId,
      userRole,
    } = filters;

    // Build where clause
    const where = {};

    // Project filter
    if (projectId) {
      where.projectId = projectId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        where.createdAt.gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Role-based access control
    if (userRole === 'MANAGER' && userId) {
      // Managers can only see their own messages
      where.managerId = userId;
    } else if (userRole === 'HR' || userRole === 'ADMIN' || userRole === 'EA') {
      // HR, Admin, EA can see all messages
      // No additional restrictions
    } else {
      // Other roles cannot access messages
      return {
        messages: [],
        total: 0,
        limit,
        offset,
      };
    }

    // Additional manager filter if specified (for searches)
    if (managerId && (userRole === 'ADMIN' || userRole === 'HR' || userRole === 'EA')) {
      where.managerId = managerId;
    }

    // Fetch total count
    const total = await prisma.whatsappMessage.count({ where });

    // Fetch messages with pagination
    const messages = await prisma.whatsappMessage.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
            phone: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return {
      messages,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error in getMessages:', error);
    throw new ApiError(500, {
      code: ERRORS.INTERNAL.DATABASE_ERROR.code,
      message: `Failed to fetch messages: ${error.message}`,
    });
  }
};

/**
 * Get a single message by ID
 * @param {string} messageId - WhatsappMessage ID
 * @param {string} userId - Current user ID (for access control)
 * @param {string} userRole - Current user role
 * @returns {Promise<object>} - WhatsappMessage record
 */
exports.getMessageById = async (messageId, userId, userRole) => {
  try {
    if (!messageId) {
      throw new ApiError(400, {
        code: 'INVALID_INPUT',
        message: 'messageId is required',
      });
    }

    const message = await prisma.whatsappMessage.findUnique({
      where: { id: messageId },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
            phone: true,
            departmentId: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            templateContent: true,
          },
        },
      },
    });

    if (!message) {
      throw new ApiError(404, {
        code: 'MESSAGE_NOT_FOUND',
        message: `WhatsApp message with ID ${messageId} not found`,
      });
    }

    // Access control
    if (userRole === 'MANAGER' && message.managerId !== userId) {
      throw new ApiError(403, {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to view this message',
      });
    }

    return message;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('Error in getMessageById:', error);
    throw new ApiError(500, {
      code: ERRORS.INTERNAL.DATABASE_ERROR.code,
      message: `Failed to fetch message: ${error.message}`,
    });
  }
};

/**
 * Get message statistics for a date range
 * @param {object} filters - {projectId?, dateFrom?, dateTo?, managerId?, userRole?, userId?}
 * @returns {Promise<object>} - Statistics
 */
exports.getMessageStatistics = async (filters = {}) => {
  try {
    const {
      projectId,
      dateFrom,
      dateTo,
      managerId,
      userRole,
      userId,
    } = filters;

    // Build where clause
    const where = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        where.createdAt.gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (userRole === 'MANAGER' && userId) {
      where.managerId = userId;
    }

    if (managerId && (userRole === 'ADMIN' || userRole === 'HR' || userRole === 'EA')) {
      where.managerId = managerId;
    }

    // Get status breakdown
    const stats = await prisma.whatsappMessage.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const total = await prisma.whatsappMessage.count({ where });
    const sent = stats.find(s => s.status === 'SENT')?._count || 0;
    const delivered = stats.find(s => s.status === 'DELIVERED')?._count || 0;
    const failed = stats.find(s => s.status === 'FAILED')?._count || 0;
    const pending = stats.find(s => s.status === 'PENDING')?._count || 0;

    return {
      total,
      sent,
      delivered,
      failed,
      pending,
      successRate: total > 0 ? ((delivered / total) * 100).toFixed(2) : 0,
    };
  } catch (error) {
    console.error('Error in getMessageStatistics:', error);
    throw new ApiError(500, {
      code: ERRORS.INTERNAL.DATABASE_ERROR.code,
      message: `Failed to fetch statistics: ${error.message}`,
    });
  }
};

/**
 * Delete old messages (data cleanup)
 * @param {number} daysOld - Delete messages older than X days
 * @returns {Promise<number>} - Number of deleted records
 */
exports.deleteOldMessages = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.whatsappMessage.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: {
          in: ['DELIVERED', 'FAILED'], // Keep only pending/sent for recent lookups
        },
      },
    });

    console.log(`Deleted ${result.count} old WhatsApp messages`);
    return result.count;
  } catch (error) {
    console.error('Error in deleteOldMessages:', error);
    // Don't throw, just log - this is a maintenance task
    return 0;
  }
};
