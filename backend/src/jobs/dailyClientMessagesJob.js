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
    // 4:03 PM IST = scheduled for 16:03
      jobInstance = cron.schedule('18 16 * * *', async () => {
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

      console.log('✅ Daily client messaging job initialized (runs at 4:18 PM IST)');
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

    // ── Group all reports by phone number ────────────────────────────────
    const messagesByPhone = {};

    const getMessageGroup = (phone, managerId) => {
      if (!messagesByPhone[phone]) {
        messagesByPhone[phone] = {
          messages: [],
          managerId,
          projectIds: [],
          reports: { seo: [], marketing: [], socialMedia: [] },
        };
      }
      return messagesByPhone[phone];
    };

    // ── 1. SEO reports ───────────────────────────────────────────────────
    console.log(`\n🌐 Processing SEO reports (${dailyReport.seo.length})...`);
    for (const proj of dailyReport.seo) {
      // Skip if no report data exists
      if (!proj.report?.hasReport) {
        console.log(`⏭️  Skipping ${proj.projectName} - No SEO report data`);
        jobStats.skipped++;
        continue;
      }

      const phone = proj.report?.clientContactNumber;
      if (!phone) { 
        console.log(`⏭️  Skipping ${proj.projectName} - No phone number`);
        jobStats.skipped++; 
        continue; 
      }

      const message = messageTemplateService.buildSeoReportMessage({
        projectName: proj.projectName,
        clientName:  proj.clientName,
        report:      proj.report,
        date:        today,
      });

      // Skip if message is empty
      if (!message || message.trim() === '') {
        console.log(`⏭️  Skipping ${proj.projectName} - Empty message`);
        jobStats.skipped++;
        continue;
      }

      // Group by phone number
      const group = getMessageGroup(phone, proj.report?.managerId || proj.assignments?.[0]?.managerId);
      group.messages.push(message);
      group.projectIds.push(proj.projectId);
      group.reports.seo.push({ project: proj, report: proj.report });
      console.log(`✅ Added SEO report to queue for ${phone}`);
    }

    // ── 2. Marketing reports ─────────────────────────────────────────────
    console.log(`\n📣 Processing Marketing reports (${dailyReport.marketing.length})...`);
    for (const proj of dailyReport.marketing) {
      // Skip if no report data exists
      if (!proj.report?.hasReport) {
        console.log(`⏭️  Skipping ${proj.projectName} - No marketing report data`);
        jobStats.skipped++;
        continue;
      }

      const phone = proj.report?.clientContactNumber;
      if (!phone) { 
        console.log(`⏭️  Skipping ${proj.projectName} - No phone number`);
        jobStats.skipped++; 
        continue; 
      }

      const message = messageTemplateService.buildMarketingReportMessage({
        projectName: proj.projectName,
        clientName:  proj.report?.clientName || proj.clientName,
        report:      proj.report,
        date:        today,
      });

      // Skip if message is empty
      if (!message || message.trim() === '') {
        console.log(`⏭️  Skipping ${proj.projectName} - Empty message`);
        jobStats.skipped++;
        continue;
      }

      // Group by phone number
      const group = getMessageGroup(phone, proj.report?.managerId || proj.assignments?.[0]?.managerId);
      group.messages.push(message);
      group.projectIds.push(proj.projectId);
      group.reports.marketing.push({ project: proj, report: proj.report });
      console.log(`✅ Added Marketing report to queue for ${phone}`);
    }

    // ── 3. Social Media projects (use project.phone) ─────────────────────
    console.log(`\n📱 Processing Social Media projects (${dailyReport.socialMedia.length})...`);
    for (const proj of dailyReport.socialMedia) {
      // Skip if no uploads or content calendar data exists
      if (!proj.uploads || proj.uploads.length === 0) {
        console.log(`⏭️  Skipping ${proj.projectName} - No uploads data`);
        jobStats.skipped++;
        continue;
      }

      const phone = proj.clientContactNumber;
      if (!phone) { 
        console.log(`⏭️  Skipping ${proj.projectName} - No phone number`);
        jobStats.skipped++; 
        continue; 
      }

      const message = messageTemplateService.buildSocialMediaReportMessage({
        projectName:     proj.projectName,
        clientName:      proj.clientName,
        contentCalendar: proj.contentCalendar,
        uploads:         proj.uploads,
        date:            today,
      });

      // Skip if message is empty
      if (!message || message.trim() === '') {
        console.log(`⏭️  Skipping ${proj.projectName} - Empty message`);
        jobStats.skipped++;
        continue;
      }

      // Group by phone number
      const group = getMessageGroup(phone, proj.assignments?.[0]?.managerId);
      group.messages.push(message);
      group.projectIds.push(proj.projectId);
      group.reports.socialMedia.push({ project: proj });
      console.log(`✅ Added Social Media report to queue for ${phone}`);
    }

    // ── Send consolidated messages by phone number ────────────────────────
    console.log(`\n📤 Sending consolidated messages...`);
    for (const [phone, data] of Object.entries(messagesByPhone)) {
      const formatted = whatsappService.formatPhoneNumber(phone);
      if (!formatted) {
        console.warn(`⚠️  Invalid phone: "${phone}" — skipping`);
        jobStats.skipped++;
        continue;
      }

      // Combine all messages into one consolidated message using professional template
      const consolidatedMessage = buildConsolidatedClientMessage(data, today);

      jobStats.totalMessages++;
      console.log(`📤 Sending consolidated message to ${formatted}`);

      const result = await whatsappService.sendMessage(formatted, consolidatedMessage);

      // Log the consolidated message
      await messageLoggingService.logMessage({
        projectId: data.projectIds[0] || null,
        managerId: data.managerId || fallbackManagerId,
        clientPhoneNumber: formatted,
        messageContent: consolidatedMessage,
        status: result.success ? 'SENT' : 'FAILED',
        messageId: result.messageId || null,
        failureReason: result.error || null,
        templateId: null,
      });

      if (result.success) {
        jobStats.messagesSent++;
        console.log(`✅ Sent consolidated message to ${formatted} (ID: ${result.messageId})`);
      } else {
        jobStats.messagesFailed++;
        console.error(`❌ Failed to send to ${formatted}: ${result.error}`);
        jobStats.errors.push({ phone: formatted, error: result.error });
      }
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

/**
 * Build professional consolidated message using detailed template format
 */
function buildConsolidatedClientMessage(data, today) {
  const dateStr = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const nextDateStr = new Date(today.getTime() + 86400000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let message = `Hi Client,\n\nHere's your *daily brand activity update* from *We Promote* for *${dateStr}*.\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  let hasSocialMedia = false;
  let hasAds = false;
  let hasSEO = false;

  // Extract data from messages
  let socialMediaInfo = { status: '', contentStatus: '', contentType: '', reel: '', post: '', video: '', uploadStatus: '' };
  let adsInfo = { platform: '', area: '', status: '', spend: '', reach: '', leads: '' };
  let seoInfo = { keyword: '', ranking: '', lastChecked: '', focus: '' };

  // Parse messages to extract structured data
  for (const msg of data.messages) {
    if (msg.includes('Social Media') || msg.includes('📱')) {
      hasSocialMedia = true;
      // Extract social media details
      if (msg.includes('APPROVED')) socialMediaInfo.contentStatus = 'Approved';
      if (msg.includes('Reel')) socialMediaInfo.reel = 'AI Production Required';
      if (msg.includes('Post')) socialMediaInfo.post = 'Shoot Required';
      if (msg.includes('Video')) socialMediaInfo.video = 'Horizontal Video';
      if (msg.includes('No uploads')) socialMediaInfo.uploadStatus = 'No upload recorded today';
      socialMediaInfo.status = 'On Track';
    } else if (msg.includes('Marketing') || msg.includes('📣') || msg.includes('Ads')) {
      hasAds = true;
      // Extract ads details
      if (msg.includes('meta') || msg.includes('Meta')) adsInfo.platform = 'Meta Ads';
      if (msg.includes('mumb')) adsInfo.area = 'Mumbai';
      if (msg.includes('Running') || msg.includes('running')) adsInfo.status = 'Running';
      
      // Extract spend using regex - look for ₹ symbol
      const spendMatch = msg.match(/₹\s*([0-9.]+)/);
      if (spendMatch) adsInfo.spend = `₹${spendMatch[1]}`;
      
      // Extract reach - more flexible pattern
      const reachMatch = msg.match(/(?:👁️?\s*)?Reach\s*:\s*(\d+)/i);
      if (reachMatch) {
        adsInfo.reach = reachMatch[1];
        console.log(`✅ Extracted Reach: ${reachMatch[1]}`);
      } else {
        console.log(`⚠️  Reach not found in: ${msg.substring(0, 100)}`);
      }
      
      // Extract leads - more flexible pattern to handle "Leads Obtained:"
      const leadsMatch = msg.match(/(?:🎯?\s*)?Leads\s+Obtained\s*:\s*(\d+)/i) || msg.match(/(?:🎯?\s*)?Leads\s*:\s*(\d+)/i);
      if (leadsMatch) {
        adsInfo.leads = leadsMatch[1];
        console.log(`✅ Extracted Leads: ${leadsMatch[1]}`);
      } else {
        console.log(`⚠️  Leads not found in: ${msg.substring(0, 100)}`);
      }
    } else if (msg.includes('SEO') || msg.includes('🔍') || msg.includes('🌐')) {
      hasSEO = true;
      // Extract SEO details
      const keywordMatch = msg.match(/(?:Keywords?|Tracked)[:\s]+•?\s*([^\n]+)/i);
      if (keywordMatch) seoInfo.keyword = keywordMatch[1].trim();
      
      // Extract ranking - look for "Ranking:" or "Current Ranking:" with # symbol
      const rankingMatch = msg.match(/(?:Current\s+)?Ranking[:\s]+#?(\d+)/i);
      if (rankingMatch) {
        seoInfo.ranking = `#${rankingMatch[1]}`;
        console.log(`✅ Extracted Ranking: #${rankingMatch[1]}`);
      }
      
      seoInfo.lastChecked = dateStr;
      seoInfo.focus = 'Improving and maintaining search visibility';
      seoInfo.status = 'On Track';
    }
  }

  // Use raw database values so metrics are not lost while parsing display text.
  const marketingReport = data.reports?.marketing?.[0]?.report;
  if (marketingReport) {
    hasAds = true;
    adsInfo.platform = marketingReport.typeOfAds || 'Meta Ads';
    adsInfo.area = marketingReport.areaName || '';
    adsInfo.status = marketingReport.isAdRunning === false ? 'Paused' : 'Running';
    adsInfo.spend = marketingReport.todayAmountSpend != null
      ? `₹${Number(marketingReport.todayAmountSpend).toFixed(2)}`
      : '';
    adsInfo.reach = marketingReport.todayReachObtained != null
      ? Number(marketingReport.todayReachObtained).toLocaleString('en-IN')
      : '';
    adsInfo.leads = marketingReport.leadObtained != null
      ? Number(marketingReport.leadObtained).toLocaleString('en-IN')
      : '';
  }

  const seoReport = data.reports?.seo?.[0]?.report;
  if (seoReport) {
    hasSEO = true;
    seoInfo.keyword = Array.isArray(seoReport.keywords)
      ? seoReport.keywords.join(', ')
      : '';
    seoInfo.ranking = seoReport.rankingNo != null ? `#${seoReport.rankingNo}` : '';
    seoInfo.lastChecked = seoReport.checkDate
      ? new Date(seoReport.checkDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      : dateStr;
    seoInfo.focus = 'Improving and maintaining search visibility';
  }

  // BUILD SOCIAL MEDIA SECTION
  if (hasSocialMedia) {
    message += `📱 *SOCIAL MEDIA*\n\n`;
    message += `Content Status: *${socialMediaInfo.contentStatus || 'Pending'}* ✅\n`;
    message += `Content Type: *Reel + Post + Horizontal Video*\n`;
    if (socialMediaInfo.reel) message += `Reel: *${socialMediaInfo.reel}*\n`;
    if (socialMediaInfo.post) message += `Post: *${socialMediaInfo.post}*\n`;
    message += `Content Title: *"fgdh"*\n\n`;
    message += `Upload Status: *${socialMediaInfo.uploadStatus || 'Pending'}*\n\n`;
    message += `Overall Status: *On Track* ✅\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  // BUILD ADS SECTION
  if (hasAds) {
    message += `📊 *ADS*\n\n`;
    if (adsInfo.platform) message += `Platform: *${adsInfo.platform}*\n`;
    if (adsInfo.area) message += `Target Area: *${adsInfo.area}*\n`;
    message += `Campaign Status: *Running* 🟢\n\n`;
    message += `Today's Performance:\n\n`;
    if (adsInfo.spend) message += `• Spend: *${adsInfo.spend}*\n`;
    if (adsInfo.reach) message += `• Reach: *${adsInfo.reach}*\n`;
    if (adsInfo.leads) message += `• Leads: *${adsInfo.leads}*\n`;
    message += `\nOverall Status: *Active* ✅\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  // BUILD SEO SECTION
  if (hasSEO) {
    message += `🔎 *SEO*\n\n`;
    if (seoInfo.keyword) message += `Keyword Tracked: *${seoInfo.keyword}*\n`;
    if (seoInfo.ranking) message += `Current Ranking: *${seoInfo.ranking}* 🥇\n`;
    message += `Last Checked: *${seoInfo.lastChecked}*\n\n`;
    message += `Current Focus: *${seoInfo.focus}*\n\n`;
    message += `Overall Status: *On Track* ✅\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  // CLIENT REQUESTS SECTION
  message += `📩 *CLIENT REQUESTS*\n\n`;
  message += `Open Requests: *0*\n\n`;
  message += `No pending client requests at this time.\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // ACCOUNT STATUS SECTION
  message += `⚡ *ACCOUNT STATUS*\n\n`;
  message += `Content: *On Track* ${hasSocialMedia ? '✅' : '⏳'}\n`;
  message += `Ads: *On Track* ${hasAds ? '✅' : '⏳'}\n`;
  message += `SEO: *On Track* ${hasSEO ? '✅' : '⏳'}\n`;
  message += `Requests: *0 Open*\n\n`;
  message += `*Next scheduled update: ${nextDateStr}*\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // FOOTER
  message += `This is an automated update by *We Promote* to keep you informed about your brand's ongoing activities and performance.\n\n`;
  message += `*WE PROMOTE*\n`;
  message += `*A Brand Authority House.*`;

  return message;
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
