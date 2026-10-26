const cron = require('node-cron');
const whatsappService = require('../services/whatsappService');
const messageLoggingService = require('../services/messageLoggingService');

let jobInstance = null;

exports.initializeDailyMessagingJob = () => {
  if (!process.env.WHATSAPP_TEMPLATE_NAME) {
    console.warn('Daily WhatsApp reports are not scheduled: WHATSAPP_TEMPLATE_NAME is not configured.');
    return null;
  }

  if (jobInstance) return jobInstance;

  jobInstance = cron.schedule('16 19 * * *', async () => {
    try {
      const stats = await runDailyMessagingJob();
      console.info('Daily WhatsApp report job completed:', stats);
    } catch (error) {
      console.error('Daily WhatsApp report job failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  });

  return jobInstance;
};

exports.stopDailyMessagingJob = () => {
  if (!jobInstance) return;
  jobInstance.stop();
  jobInstance.destroy();
  jobInstance = null;
};

async function runDailyMessagingJob() {
  if (!process.env.WHATSAPP_TEMPLATE_NAME) {
    throw new Error('Daily WhatsApp reports are disabled until WHATSAPP_TEMPLATE_NAME is configured.');
  }

  const prisma = require('../config/prisma');
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, role: true },
  });
  if (!admin) throw new Error('No admin account is available to audit scheduled WhatsApp reports.');

  const controller = require('../modules/whatsapp-message/whatsapp-message.controller');
  const previews = await controller.buildClientMessagePreviews({
    ...admin,
    roles: ['ADMIN'],
  });
  const stats = {
    totalMessages: 0,
    messagesSent: 0,
    messagesFailed: 0,
    skipped: 0,
    errors: [],
  };
  const inFlightNumbers = new Set();

  for (const preview of previews) {
    const recipient = whatsappService.formatPhoneNumber(preview.clientPhone);
    const projectId = preview.projectIds.find(Boolean);
    if (!recipient || !preview.isClientPhoneValid || !projectId) {
      stats.skipped++;
      continue;
    }
    if (inFlightNumbers.has(recipient)) {
      stats.skipped++;
      continue;
    }
    inFlightNumbers.add(recipient);
    stats.totalMessages++;

    try {
      if (!Array.isArray(preview.templateParameters) || preview.templateParameters.length !== 11) {
        throw new Error(`Expected 11 WhatsApp template variables for ${recipient}.`);
      }

      const result = await whatsappService.sendTemplateMessage(
        recipient,
        preview.templateParameters,
        preview.messageBody,
      );
      await messageLoggingService.logMessage({
        projectId,
        managerId: admin.id,
        clientPhoneNumber: recipient,
        messageContent: preview.messageBody,
        status: result.success ? 'SENT' : 'FAILED',
        messageId: result.messageId || null,
        failureReason: result.error || null,
      });

      if (result.success) {
        stats.messagesSent++;
      } else {
        stats.messagesFailed++;
        stats.errors.push({
          phone: recipient,
          error: result.error || 'WhatsApp template send failed.',
        });
      }
    } catch (error) {
      stats.messagesFailed++;
      stats.errors.push({ phone: recipient, error: error.message });
      console.error(`Failed to send scheduled report to ${recipient}:`, error);
    } finally {
      inFlightNumbers.delete(recipient);
    }
  }

  console.info('Daily WhatsApp report summary:', stats);
  return stats;
}

exports.triggerMessagingJobManually = async () => runDailyMessagingJob();

exports.getJobStatus = () => ({
  isRunning: jobInstance !== null,
  nextExecution: jobInstance ? 'Check logs for exact time' : 'Job not initialized',
  timezone: 'Asia/Kolkata (IST)',
  scheduledTime: '7:16 PM IST daily',
});
