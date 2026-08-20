const cron = require('node-cron');
const whatsappService = require('../services/whatsappService');
const messageTemplateService = require('../services/messageTemplateService');
const messageLoggingService = require('../services/messageLoggingService');
const dailyReportService = require('../modules/daily-report/daily-report.service');

/**
 * Daily client messaging job
 * Runs at 11:15 AM IST
 * 
 * Flow:
 * 1. Fetch all Social Media projects with phone numbers
 * 2. For each project with assigned managers:
 *    - Generate daily message (upload status + today's stats)
 *    - Send message via WhatsApp
 *    - Log message to database
 * 3. Handle failures gracefully (don't block other projects)
 * 4. Log job execution summary
 */

let jobInstance = null;

/**
 * Initialize and start the daily messaging job
 */
exports.initializeDailyMessagingJob = () => {
  try {
    // 11:15 AM IST = 11:15
    // Cron format: minute hour day-of-month month day-of-week
    // "15 11 * * *" = every day at 11:15 (in server timezone)
    // We use TZ environment variable to set timezone to IST

    // For IST (UTC+5:30), we need to calculate the equivalent UTC time
    // 11:15 AM IST = 5:45 AM UTC
    jobInstance = cron.schedule('55 12 * * *', async () => {
      console.log('🚀 ⏰ Starting daily client report dispatch at', new Date().toISOString());
      try {
        await runDailyMessagingJob();
      } catch (error) {
        console.error('❌ Daily messaging job failed:', error);
        // Don't throw - the job should keep running
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata', // IST timezone
    });

    console.log('✅ Daily client messaging job initialized (runs at 12:55 PM IST)');
    return jobInstance;
  } catch (error) {
    console.error('Failed to initialize daily messaging job:', error);
    throw error;
  }
};

/**
 * Stop the scheduled job
 */
exports.stopDailyMessagingJob = () => {
  if (jobInstance) {
    jobInstance.stop();
    jobInstance.destroy();
    jobInstance = null;
    console.log('⏹️ Daily messaging job stopped');
  }
};

/**
 * Main job execution logic
 */

/**
 * Main job execution logic — sends per-report WhatsApp messages to clients.
 * Sources contact numbers from:
 *   SEO:          seoReport.clientContactNumber
 *   Marketing:    marketingReport.clientContactNumber
 *   Social Media: project.phone
 */
async function runDailyMessagingJob() {
  const startTime = Date.now();
  const jobStats = {
    totalMessages: 0,
    messagesSent: 0,
    messagesFailed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const prisma = require('../config/prisma');
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const fallbackManagerId = adminUser?.id;
    const today = new Date();

    // ── Fetch today's full daily report ──────────────────────────────────
    console.log('📋 Fetching today\'s daily report data...');
    const dailyReport = await dailyReportService.getDailyReport(
      { id: 'system', role: 'ADMIN' },
      { date: today.toISOString().split('T')[0], department: 'all' }
    );

    // ── Helper: send + log one message ───────────────────────────────────
    async function dispatch({ phone, message, projectId, managerId, label }) {
      const formatted = whatsappService.formatPhoneNumber(phone);
      if (!formatted) {
        console.warn(`⚠️  Invalid phone for ${label}: "${phone}" — skipping`);
        jobStats.skipped++;
        return;
      }

      jobStats.totalMessages++;
      console.log(`📤 Sending to ${label} → ${formatted}`);

      const result = await whatsappService.sendMessage(formatted, message);

      await messageLoggingService.logMessage({
        projectId: projectId || null,
        managerId: managerId || fallbackManagerId,
        clientPhoneNumber: formatted,
        messageContent: message,
        status: result.success ? 'SENT' : 'FAILED',
        messageId: result.messageId || null,
        failureReason: result.error || null,
        templateId: null,
      });

      if (result.success) {
        jobStats.messagesSent++;
        console.log(`✅ Sent to ${label} (ID: ${result.messageId})`);
      } else {
        jobStats.messagesFailed++;
        console.error(`❌ Failed for ${label}: ${result.error}`);
        jobStats.errors.push({ label, error: result.error });
      }
    }

    // ── 1. SEO reports ───────────────────────────────────────────────────
    console.log(`\n🌐 Processing SEO reports (${dailyReport.seo.length})...`);
    for (const proj of dailyReport.seo) {
      const phone = proj.report?.clientContactNumber;
      if (!phone) { jobStats.skipped++; continue; }

      const message = messageTemplateService.buildSeoReportMessage({
        projectName: proj.projectName,
        clientName:  proj.clientName,
        report:      proj.report,
        date:        today,
      });

      await dispatch({ phone, message, projectId: proj.projectId, managerId: proj.report?.managerId || proj.assignments?.[0]?.managerId, label: `SEO/${proj.projectName}` });
    }

    // ── 2. Marketing reports ─────────────────────────────────────────────
    console.log(`\n📣 Processing Marketing reports (${dailyReport.marketing.length})...`);
    for (const proj of dailyReport.marketing) {
      const phone = proj.report?.clientContactNumber;
      if (!phone) { jobStats.skipped++; continue; }

      const message = messageTemplateService.buildMarketingReportMessage({
        projectName: proj.projectName,
        clientName:  proj.report?.clientName || proj.clientName,
        report:      proj.report,
        date:        today,
      });

      await dispatch({ phone, message, projectId: proj.projectId, managerId: proj.report?.managerId || proj.assignments?.[0]?.managerId, label: `Marketing/${proj.projectName}` });
    }

    // ── 3. Social Media projects (use project.phone) ─────────────────────
    console.log(`\n📱 Processing Social Media projects (${dailyReport.socialMedia.length})...`);
    for (const proj of dailyReport.socialMedia) {
      const phone = proj.clientContactNumber;
      if (!phone) { jobStats.skipped++; continue; }

      const message = messageTemplateService.buildSocialMediaReportMessage({
        projectName:     proj.projectName,
        clientName:      proj.clientName,
        contentCalendar: proj.contentCalendar,
        uploads:         proj.uploads,
        date:            today,
      });

      await dispatch({ phone, message, projectId: proj.projectId, managerId: proj.assignments?.[0]?.managerId, label: `SMM/${proj.projectName}` });
    }

  } catch (error) {
    console.error('❌ Critical error in daily messaging job:', error);
    jobStats.errors.push({ type: 'CRITICAL', error: error.message });
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '═'.repeat(55));
  console.log('📊 DAILY CLIENT REPORT JOB SUMMARY');
  console.log('═'.repeat(55));
  console.log(`⏱️  Duration:          ${duration}s`);
  console.log(`📬 Total Dispatched:  ${jobStats.totalMessages}`);
  console.log(`✅ Sent:              ${jobStats.messagesSent}`);
  console.log(`❌ Failed:            ${jobStats.messagesFailed}`);
  console.log(`⏭️  Skipped (no phone): ${jobStats.skipped}`);
  if (jobStats.errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    jobStats.errors.forEach(e => console.log(`   - ${e.label || e.type}: ${e.error}`));
  }
  console.log('═'.repeat(55) + '\n');

  // Weekly cleanup
  if (shouldCleanupMessages()) {
    console.log('🗑️  Cleaning up old messages...');
    const deleted = await messageLoggingService.deleteOldMessages(90);
    console.log(`✅ Deleted ${deleted} old messages`);
  }

  return jobStats;
}


function shouldCleanupMessages() {
  const today = new Date();
  // Run cleanup on Sundays
  return today.getDay() === 0;
}

/**
 * Manual trigger for testing - allows immediate job execution
 */
exports.triggerMessagingJobManually = async () => {
  console.log('🔄 Manually triggering daily messaging job...');
  try {
    const stats = await runDailyMessagingJob();
    return stats;
  } catch (error) {
    console.error('Error in manual job trigger:', error);
    throw error;
  }
};

/**
 * Get job status
 */
exports.getJobStatus = () => {
  return {
    isRunning: jobInstance !== null,
    nextExecution: jobInstance ? 'Check logs for exact time' : 'Job not initialized',
    timezone: 'Asia/Kolkata (IST)',
    scheduledTime: '11:15 AM IST daily',
  };
};
