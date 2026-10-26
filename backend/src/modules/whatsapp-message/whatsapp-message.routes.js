const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const {
  getMessages,
  getMessageById,
  getMessageStats,
  sendManualMessage,
  triggerJobManually,
  getMessagePreviews,
} = require('./whatsapp-message.controller');

const router = express.Router();

// Middleware: Authentication required for all routesl̥
router.use(authenticate);

router.get('/previews', authorize('ADMIN', 'HR', 'MANAGER'), getMessagePreviews);

router.get('/', authorize('ADMIN', 'HR', 'EA', 'MANAGER'), getMessages);


router.get('/:id', authorize('ADMIN', 'HR', 'EA', 'MANAGER'), getMessageById);

router.get('/stats/summary', authorize('ADMIN', 'HR', 'EA', 'MANAGER'), getMessageStats);

router.post('/send-manual', authorize('ADMIN', 'HR', 'EA', 'MANAGER'), sendManualMessage);

router.post('/trigger-job', authorize('ADMIN', 'HR'), triggerJobManually);

module.exports = router;
