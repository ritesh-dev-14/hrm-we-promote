const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ERRORS = require('../utils/errors');
const { formatPhoneNumber } = require('./whatsappService');

/**
 * Generate daily client message with rich Social Media and/or Marketing data.
 *
 * Data sources:
 *  - ProjectMonthlySheet + ProjectMonthlySheetDay  → Social Media content calendar
 *  - Upload (global uploads module, matched by projectName) → upload items & platform
 *  - MarketingReport → ad stats for Marketing dept
 *
 * @param {string} projectId
 * @param {Date}   date
 */
exports.generateDailyClientMessage = async (projectId, date = new Date()) => {
  try {
    // ── 1. Fetch project ───────────────────────────────────────────────────────
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        department: { select: { name: true } },
      },
    });

    if (!project) {
      throw new ApiError(404, {
        code: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${projectId} not found`,
      });
    }

    const clientPhoneNumber = formatPhoneNumber(project.phone);
    if (!clientPhoneNumber) {
      throw new ApiError(400, {
        code: 'CLIENT_PHONE_MISSING',
        message: `Client phone number is invalid or not configured for project: ${project.projectName}. Received: "${project.phone || ''}"`,
      });
    }

    // ── 2. Date helpers ────────────────────────────────────────────────────────
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const deptName = (project.department?.name || '').toLowerCase();
    const isSocialMedia = deptName.includes('social media');
    const isMarketing   = deptName.includes('marketing');

    // ── 3. Fetch Social Media data ─────────────────────────────────────────────
    let monthlySheetDay = null;
    let todayUploads    = [];

    if (isSocialMedia) {
      // 3a. Today's entry from the Content Calendar (ProjectMonthlySheetDay)
      monthlySheetDay = await prisma.projectMonthlySheetDay.findFirst({
        where: {
          sheet: { projectId },
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: { sheet: true },
      });

      // 3b. Today's Upload records (matched by project name — no FK exists)
      const rawUploads = await prisma.upload.findMany({
        where: {
          uploadDate: { gte: startOfDay, lte: endOfDay },
          projectName: {
            equals: project.projectName,
            mode: 'insensitive',
          },
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      todayUploads = rawUploads;
    }

    // ── 4. Fetch Marketing data ────────────────────────────────────────────────
    let marketingReport = null;

    if (isMarketing) {
      marketingReport = await prisma.marketingReport.findFirst({
        where: {
          projectId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });
    }

    // ── 5. Build message ───────────────────────────────────────────────────────
    const messageBody = buildMessage({
      projectName:    project.projectName,
      clientName:     project.clientName || 'Valued Client',
      departmentName: project.department?.name || '',
      isSocialMedia,
      isMarketing,
      monthlySheetDay,
      todayUploads,
      marketingReport,
      date,
    });

    return {
      messageBody,
      projectId,
      clientPhoneNumber,
      clientName:     project.clientName || project.projectName,
      departmentType: project.department?.name || 'UNKNOWN',
      templateType:   'DAILY_CLIENT_REPORT',
      // Raw data for logging/debugging
      monthlySheetDay,
      todayUploads,
      marketingReport,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error in generateDailyClientMessage:', error);
    throw new ApiError(500, {
      code: ERRORS.INTERNAL.DATABASE_ERROR.code,
      message: `Failed to generate message for project ${projectId}: ${error.message}`,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Message builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the full WhatsApp message string.
 */
function buildMessage({
  projectName,
  clientName,
  departmentName,
  isSocialMedia,
  isMarketing,
  monthlySheetDay,
  todayUploads,
  marketingReport,
  date,
}) {
  const dateStr = formatDate(date);
  const divider = '━━━━━━━━━━━━━━━━━━━━━━';

  let msg = '';

  // ── Header ─────────────────────────────────────────────────────────────────
  msg += '📱 *Automated Message from We Promote*\n';
  msg += `Project: *${projectName}*\n`;
  msg += `Date: ${dateStr}\n`;

  // ── Social Media Section ───────────────────────────────────────────────────
  if (isSocialMedia) {
    msg += `\n${divider}\n\n`;
    msg += '📅 *Social Media — Today\'s Update*\n';

    // Content Calendar block
    msg += '\n📤 *Content Calendar*\n';
    if (monthlySheetDay) {
      const status = monthlySheetDay.uploadStatus || 'PENDING';
      const statusEmoji = {
        APPROVED:  '✅',
        PENDING:   '⏳',
        REJECTED:  '❌',
        DONE:      '✅',
      }[status] || '⏳';

      msg += `${statusEmoji} Upload Status: *${status}*\n`;

      // Content type
      const types = [];
      if (monthlySheetDay.reelType)  types.push(`Reel (${monthlySheetDay.reelType})`);
      if (monthlySheetDay.postType)  types.push(`Post (${monthlySheetDay.postType})`);
      if (monthlySheetDay.videoType) types.push(`Video (${monthlySheetDay.videoType})`);
      if (types.length > 0) {
        msg += `🎞️ Content Type: ${types.join(' + ')}\n`;
      }

      if (monthlySheetDay.title) {
        msg += `📝 Title: "${monthlySheetDay.title}"\n`;
      }

      if (monthlySheetDay.description) {
        msg += `📄 Description: ${monthlySheetDay.description}\n`;
      }

      // Links
      const submissionLinks   = monthlySheetDay.submissionLinks   || [];
      const contentUploadLinks = monthlySheetDay.contentUploadLinks || [];
      const videoUploadLinks  = monthlySheetDay.videoUploadLinks  || [];

      if (submissionLinks.length > 0) {
        msg += `🔗 Submission Link: ${submissionLinks[0]}\n`;
      }
      if (contentUploadLinks.length > 0) {
        msg += `📸 Content Link: ${contentUploadLinks[0]}\n`;
      }
      if (videoUploadLinks.length > 0) {
        msg += `🎬 Video Link: ${videoUploadLinks[0]}\n`;
      }

      if (monthlySheetDay.uploadStatus === 'REJECTED' && monthlySheetDay.uploadRejectReason) {
        msg += `⚠️ Reject Reason: ${monthlySheetDay.uploadRejectReason}\n`;
      }
    } else {
      msg += '📭 No content scheduled for today in the Content Calendar.\n';
    }

    // Uploads block
    msg += '\n📦 *Uploads*\n';
    if (todayUploads.length > 0) {
      const totalCount = todayUploads.reduce((sum, u) => sum + (u.totalUploads || 0), 0);
      msg += `✅ ${totalCount} upload(s) recorded today\n`;

      // Collect all items across all upload records
      const allItems = todayUploads.flatMap(u => u.items || []);
      if (allItems.length > 0) {
        allItems.forEach(item => {
          const platform = item.platform ? ` (${item.platform})` : '';
          msg += `  • ${item.dataType}${platform}\n`;
        });
      }
    } else {
      msg += '❌ No uploads recorded today.\n';
    }
  }

  // ── Marketing Section ──────────────────────────────────────────────────────
  if (isMarketing) {
    msg += `\n${divider}\n\n`;
    msg += '📊 *Marketing — Today\'s Report*\n\n';

    if (marketingReport) {
      // Ad running status
      if (marketingReport.isAdRunning !== null && marketingReport.isAdRunning !== undefined) {
        const adEmoji = marketingReport.isAdRunning ? '🟢' : '🔴';
        const adStatus = marketingReport.isAdRunning ? 'Running' : 'Not Running';
        msg += `${adEmoji} *Ad Status:* ${adStatus}\n`;

        if (!marketingReport.isAdRunning && marketingReport.reasonNotRunning) {
          msg += `  ↳ Reason: ${marketingReport.reasonNotRunning}\n`;
        }
      }

      if (marketingReport.typeOfAds) {
        msg += `📢 *Type of Ads:* ${marketingReport.typeOfAds}\n`;
      }

      if (marketingReport.areaName) {
        msg += `🗺️ *Area:* ${marketingReport.areaName}\n`;
      }

      if (marketingReport.todayReachObtained !== null && marketingReport.todayReachObtained !== undefined) {
        msg += `👥 *Reach Obtained:* ${marketingReport.todayReachObtained.toLocaleString('en-IN')}\n`;
      }

      if (marketingReport.todayAmountSpend !== null && marketingReport.todayAmountSpend !== undefined) {
        msg += `💰 *Amount Spent:* ₹${marketingReport.todayAmountSpend.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}\n`;
      }

      if (marketingReport.leadObtained !== null && marketingReport.leadObtained !== undefined) {
        msg += `🎯 *Leads Obtained:* ${marketingReport.leadObtained}\n`;
      }

      if (marketingReport.videoLink) {
        msg += `🔗 *Video / Post Link:* ${marketingReport.videoLink}\n`;
      }
    } else {
      msg += '📭 No marketing report submitted for today.\n';
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  msg += `\n${divider}\n`;
  msg += '_Sent by We Promote HRM System_';

  return msg.trim();
}

/**
 * Format date as "Wed, 19 Aug, 2026"
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year:    'numeric',
    month:   'short',
    day:     'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Get messaging-enabled projects (Social Media & Marketing with phone numbers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all projects that should receive WhatsApp messaging.
 * @returns {Promise<Array>}
 */
exports.getMessagingEnabledProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        phone: { not: null },
        OR: [
          {
            department: {
              name: { contains: 'social media', mode: 'insensitive' },
            },
          },
          {
            department: {
              name: { contains: 'marketing', mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        department: { select: { name: true } },
        assignments: {
          select: {
            managerId: true,
            manager: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return projects;
  } catch (error) {
    console.error('Error fetching messaging-enabled projects:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format message data for storing in database.
 * @param {object} messageData
 * @returns {object}
 */
exports.formatMessageForDatabase = (messageData) => {
  return {
    projectId:         messageData.projectId,
    managerId:         messageData.managerId,
    clientPhoneNumber: messageData.clientPhoneNumber,
    messageContent:    messageData.messageBody,
    templateId:        messageData.templateId || null,
    status:            'PENDING',
    createdAt:         new Date(),
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// PER-DEPARTMENT MESSAGE BUILDERS (used by 11:15 AM daily job)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a nice WhatsApp message for an SEO report.
 */
exports.buildSeoReportMessage = ({ projectName, clientName, report, date }) => {
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  const dateStr = formatDate(date || new Date());

  let msg = '';
  msg += `🌐 *Daily SEO Update*\n`;
  msg += `📋 *Project:* ${projectName}\n`;
  if (clientName) msg += `👤 *Client:* ${clientName}\n`;
  msg += `📅 *Date:* ${dateStr}\n`;
  msg += `${divider}\n\n`;

  if (report && report.hasReport) {
    if (report.keywords && report.keywords.length > 0) {
      msg += `🔍 *Keywords Tracked:*\n`;
      report.keywords.forEach(kw => { msg += `   • ${kw}\n`; });
    }
    if (report.rankingNo !== null && report.rankingNo !== undefined) {
      const rankEmoji = report.rankingNo <= 3 ? '🥇' : report.rankingNo <= 10 ? '📈' : '📊';
      msg += `${rankEmoji} *Current Ranking:* #${report.rankingNo}\n`;
    }
    if (report.checkDate) {
      const checked = new Date(report.checkDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
      });
      msg += `🕐 *Last Checked:* ${checked}\n`;
    }
    if (report.remarks) {
      msg += `📝 *Remarks:* ${report.remarks}\n`;
    }
  } else {
    msg += `📭 No SEO report submitted for today.\n`;
  }

  msg += `\n${divider}\n`;
  msg += `✨ _Working hard to boost your online visibility!_\n`;
  msg += `_— We Promote HRM System_`;

  return msg.trim();
};

/**
 * Build a nice WhatsApp message for a Marketing report.
 */
exports.buildMarketingReportMessage = ({ projectName, clientName, report, date }) => {
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  const dateStr = formatDate(date || new Date());

  let msg = '';
  msg += `📣 *Daily Marketing Report*\n`;
  msg += `📋 *Project:* ${projectName}\n`;
  if (clientName) msg += `👤 *Client:* ${clientName}\n`;
  msg += `📅 *Date:* ${dateStr}\n`;
  msg += `${divider}\n\n`;

  if (report && report.hasReport) {
    // Ad Status
    if (report.isAdRunning !== null && report.isAdRunning !== undefined) {
      const adEmoji = report.isAdRunning ? '🟢' : '🔴';
      msg += `${adEmoji} *Ad Status:* ${report.isAdRunning ? 'Running' : 'Not Running'}\n`;
      if (!report.isAdRunning && report.reasonNotRunning) {
        msg += `   ↳ Reason: ${report.reasonNotRunning}\n`;
      }
    }
    if (report.typeOfAds) msg += `🎯 *Type of Ads:* ${report.typeOfAds}\n`;
    if (report.areaName)  msg += `📍 *Area:* ${report.areaName}\n`;

    msg += `\n📊 *Today's Performance*\n`;
    if (report.todayReachObtained !== null && report.todayReachObtained !== undefined) {
      msg += `👁️  *Reach:* ${Number(report.todayReachObtained).toLocaleString('en-IN')}\n`;
    }
    if (report.todayAmountSpend !== null && report.todayAmountSpend !== undefined) {
      msg += `💰 *Amount Spent:* ₹${Number(report.todayAmountSpend).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    }
    if (report.leadObtained !== null && report.leadObtained !== undefined) {
      msg += `🎯 *Leads Obtained:* ${report.leadObtained}\n`;
    }
    if (report.videoLink) {
      msg += `🔗 *Campaign Link:* ${report.videoLink}\n`;
    }
    if (report.campaignStartDate || report.campaignEndDate) {
      const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' }) : '?';
      msg += `📆 *Campaign Period:* ${fmt(report.campaignStartDate)} – ${fmt(report.campaignEndDate)}\n`;
    }
  } else {
    msg += `📭 No marketing report submitted for today.\n`;
  }

  msg += `\n${divider}\n`;
  msg += `🚀 _Your brand is growing every day!_\n`;
  msg += `_— We Promote HRM System_`;

  return msg.trim();
};

/**
 * Build a nice WhatsApp message for a Social Media project.
 */
exports.buildSocialMediaReportMessage = ({ projectName, clientName, contentCalendar, uploads, date }) => {
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  const dateStr = formatDate(date || new Date());

  let msg = '';
  msg += `📱 *Daily Social Media Update*\n`;
  msg += `📋 *Project:* ${projectName}\n`;
  if (clientName) msg += `👤 *Client:* ${clientName}\n`;
  msg += `📅 *Date:* ${dateStr}\n`;
  msg += `${divider}\n\n`;

  // Content Calendar
  msg += `📆 *Content Calendar*\n`;
  if (contentCalendar && contentCalendar.hasEntry) {
    const statusEmoji = contentCalendar.uploadStatus === 'APPROVED' ? '✅' : contentCalendar.uploadStatus === 'REJECTED' ? '❌' : '⏳';
    msg += `${statusEmoji} Status: ${contentCalendar.uploadStatus || 'Pending'}\n`;
    if (contentCalendar.contentType) msg += `🎬 Type: ${contentCalendar.contentType}\n`;
    if (contentCalendar.title)       msg += `📝 Title: "${contentCalendar.title}"\n`;
    if (contentCalendar.contentUploadLinks && contentCalendar.contentUploadLinks.length > 0) {
      msg += `🔗 Content: ${contentCalendar.contentUploadLinks[0]}\n`;
    }
    if (contentCalendar.rejectReason) {
      msg += `⚠️ Reject Reason: ${contentCalendar.rejectReason}\n`;
    }
  } else {
    msg += `📭 No content scheduled for today.\n`;
  }

  // Uploads
  msg += `\n📤 *Uploads*\n`;
  if (uploads && uploads.hasUploads) {
    msg += `✅ ${uploads.totalUploads} upload(s) recorded today\n`;
    const allItems = (uploads.records || []).flatMap(r => r.items || []);
    allItems.forEach(item => {
      const platform = item.platform ? ` (${item.platform})` : '';
      msg += `   • ${item.dataType}${platform}\n`;
    });
  } else {
    msg += `⏳ No uploads recorded yet today.\n`;
  }

  msg += `\n${divider}\n`;
  msg += `🌟 _Creating content that connects!_\n`;
  msg += `_— We Promote HRM System_`;

  return msg.trim();
};

