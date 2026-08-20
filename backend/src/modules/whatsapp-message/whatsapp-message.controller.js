const messageLoggingService = require('../../services/messageLoggingService');
const messageTemplateService = require('../../services/messageTemplateService');
const whatsappService = require('../../services/whatsappService');
const dailyMessagingJob = require('../../jobs/dailyClientMessagesJob');
const ApiError = require('../../utils/ApiError');
const ERRORS = require('../../utils/errors');
const prisma = require('../../config/prisma');

/**
 * GET /api/whatsapp-messages
 * Fetch messages with filters and pagination
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { projectId, dateFrom, dateTo, status, managerId, limit = 50, offset = 0 } = req.query;
    const user = req.user;

    // Validate pagination
    const pageLimit = Math.min(parseInt(limit) || 50, 200); // Max 200 per page
    const pageOffset = Math.max(parseInt(offset) || 0, 0);

    // Validate date range
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      if (from > to) {
        throw new ApiError(400, {
          code: 'INVALID_DATE_RANGE',
          message: 'dateFrom must be before or equal to dateTo',
        });
      }
    }

    // Build filters
    const filters = {
      projectId,
      dateFrom,
      dateTo,
      status,
      managerId,
      userId: user.id,
      userRole: user.role,
    };

    // Fetch messages
    const result = await messageLoggingService.getMessages(
      filters,
      pageLimit,
      pageOffset
    );

    // Format response
    const messages = result.messages.map(msg => ({
      id: msg.id,
      projectId: msg.projectId,
      projectName: msg.project.projectName,
      clientName: msg.project.clientName || msg.project.projectName,
      clientPhone: msg.clientPhoneNumber,
      managerName: msg.manager.name,
      messagePreview: msg.messageContent.substring(0, 100) + '...',
      status: msg.status,
      sentAt: msg.sentAt,
      deliveredAt: msg.deliveredAt,
      createdAt: msg.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total: result.total,
        limit: pageLimit,
        offset: pageOffset,
        pages: Math.ceil(result.total / pageLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/whatsapp-messages/:id
 * Fetch full message details
 */
exports.getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Fetch message with access control
    const message = await messageLoggingService.getMessageById(
      id,
      user.id,
      user.role
    );

    // Format response with full content
    const formattedMessage = {
      id: message.id,
      projectId: message.project.id,
      projectName: message.project.projectName,
      clientName: message.project.clientName || message.project.projectName,
      clientPhone: message.clientPhoneNumber,
      managerName: message.manager.name,
      managerEmail: message.manager.email,
      fullContent: message.messageContent,
      status: message.status,
      messageId: message.messageId,
      failureReason: message.failureReason,
      sentAt: message.sentAt,
      deliveredAt: message.deliveredAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      template: message.template ? {
        id: message.template.id,
        name: message.template.name,
      } : null,
    };

    res.status(200).json({
      success: true,
      data: formattedMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/whatsapp-messages/stats/summary
 * Get message statistics
 */
exports.getMessageStats = async (req, res, next) => {
  try {
    const { projectId, dateFrom, dateTo, managerId } = req.query;
    const user = req.user;

    const filters = {
      projectId,
      dateFrom,
      dateTo,
      managerId,
      userId: user.id,
      userRole: user.role,
    };

    const stats = await messageLoggingService.getMessageStatistics(filters);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/whatsapp-messages/send-manual
 * Manually send a message to a project client
 */
exports.sendManualMessage = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const user = req.user;

    // Validate projectId
    if (!projectId) {
      throw new ApiError(400, {
        code: 'INVALID_INPUT',
        message: 'projectId is required',
      });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: true,
        department: {
          select: { name: true },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, {
        code: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${projectId} not found`,
      });
    }

    // Access control: Manager can only send for their assigned projects
    if (user.role === 'MANAGER') {
      const isAssigned = project.assignments.some(a => a.managerId === user.id);
      if (!isAssigned) {
        throw new ApiError(403, {
          code: 'ACCESS_DENIED',
          message: 'You are not assigned to this project',
        });
      }
    }

    // Verify department is Social Media or Marketing
    const deptName = (project.department?.name || '').toLowerCase();
    const isMessagingEnabled = deptName.includes('social media') || deptName.includes('marketing');

    if (!isMessagingEnabled) {
      throw new ApiError(400, {
        code: 'INVALID_DEPARTMENT',
        message: `WhatsApp messaging is not enabled for ${deptName} department`,
      });
    }

    // Verify project has client phone
    if (!project.phone) {
      throw new ApiError(400, {
        code: 'CLIENT_PHONE_MISSING',
        message: `Client phone number not configured for project: ${project.projectName}`,
      });
    }

    // Generate message
    const messageData = await messageTemplateService.generateDailyClientMessage(
      projectId,
      new Date()
    );

    // Send message
    const sendResult = await whatsappService.sendMessage(
      messageData.clientPhoneNumber,
      messageData.messageBody
    );

    // Log message
    const logData = {
      projectId,
      managerId: user.id,
      clientPhoneNumber: messageData.clientPhoneNumber,
      messageContent: messageData.messageBody,
      status: sendResult.success ? 'SENT' : 'FAILED',
      messageId: sendResult.messageId || null,
      failureReason: sendResult.error || null,
    };

    const savedMessage = await messageLoggingService.logMessage(logData);

    // Prepare response
    const responseData = {
      id: savedMessage.id,
      projectName: project.projectName,
      clientName: project.clientName || project.projectName,
      clientPhone: messageData.clientPhoneNumber,
      status: sendResult.success ? 'sent' : 'failed',
      message: sendResult.success
        ? 'Message sent successfully'
        : `Failed to send: ${sendResult.error}`,
      messageId: sendResult.messageId,
      sentAt: new Date(),
    };

    const statusCode = sendResult.success ? 200 : 400;
    res.status(statusCode).json({
      success: sendResult.success,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/whatsapp-messages/trigger-job
 * Manually trigger the daily messaging job (admin only)
 */
exports.triggerJobManually = async (req, res, next) => {
  try {
    // Only HR and Admin can trigger the job
    if (!['ADMIN', 'HR'].includes(req.user.role)) {
      throw new ApiError(403, {
        code: 'ACCESS_DENIED',
        message: 'Only Admins and HR can trigger messaging jobs',
      });
    }

    console.log(`🔄 Manual job trigger by ${req.user.name} (${req.user.role})`);

    // Trigger the job
    const stats = await dailyMessagingJob.triggerMessagingJobManually();

    res.status(200).json({
      success: true,
      message: 'Daily messaging job triggered successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
