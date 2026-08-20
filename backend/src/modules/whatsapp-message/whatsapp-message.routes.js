const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const {
  getMessages,
  getMessageById,
  getMessageStats,
  sendManualMessage,
  triggerJobManually,
} = require('./whatsapp-message.controller');

const router = express.Router();

// Middleware: Authentication required for all routes
router.use(authenticate);

/**
 * GET /api/whatsapp-messages
 * Get message history with filters
 * Query params: projectId, dateFrom, dateTo, status, managerId, limit, offset
 * Access: Admin, HR, EA (all messages), Manager (own messages only)
 */
router.get('/', authorize(['ADMIN', 'HR', 'EA', 'MANAGER']), getMessages);

/**
 * GET /api/whatsapp-messages/:id
 * Get full message details
 * Access: Admin, HR, EA (any message), Manager (own messages only)
 */
router.get('/:id', authorize(['ADMIN', 'HR', 'EA', 'MANAGER']), getMessageById);

/**
 * GET /api/whatsapp-messages/stats
 * Get message statistics (counts by status, success rate, etc.)
 * Query params: projectId, dateFrom, dateTo, managerId
 * Access: Admin, HR, EA, Manager
 */
router.get('/stats/summary', authorize(['ADMIN', 'HR', 'EA', 'MANAGER']), getMessageStats);

/**
 * POST /api/whatsapp-messages/send-manual
 * Manually send a WhatsApp message to a project client
 * Body: { projectId }
 * Access: Admin, HR, EA, Manager (for their projects)
 */
router.post('/send-manual', authorize(['ADMIN', 'HR', 'EA', 'MANAGER']), sendManualMessage);

/**
 * POST /api/whatsapp-messages/trigger-job
 * Manually trigger the daily messaging job (for testing/debugging)
 * Access: Admin, HR only
 */
router.post('/trigger-job', authorize(['ADMIN', 'HR']), triggerJobManually);

module.exports = router;
