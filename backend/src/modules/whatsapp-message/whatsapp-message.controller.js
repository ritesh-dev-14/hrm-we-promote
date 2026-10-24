const messageLoggingService = require('../../services/messageLoggingService');
const messageTemplateService = require('../../services/messageTemplateService');
const whatsappService = require('../../services/whatsappService');
const dailyMessagingJob = require('../../jobs/dailyClientMessagesJob');
const ApiError = require('../../utils/ApiError');
const ERRORS = require('../../utils/errors');
const prisma = require('../../config/prisma');
const dailyReportService = require('../daily-report/daily-report.service');

const normalizePhoneKey = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('91') && [12, 13].includes(digits.length)) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
};

const getDateKeyInIST = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(date));
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const shiftDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

async function getSubmittedMarketingReports(dateKey, user) {
  const startOfDay = new Date(`${dateKey}T00:00:00+05:30`);
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);
  const reports = await prisma.marketingReport.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      ...(user.role === 'MANAGER'
        ? { project: { assignments: { some: { managerId: user.id } } } }
        : {}),
    },
    include: {
      manager: { select: { id: true, name: true } },
      project: {
        select: {
          id: true,
          projectName: true,
          clientName: true,
          phone: true,
          department: { select: { name: true } },
          assignments: { select: { manager: { select: { name: true } } } },
        },
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  const latestReportsByProject = new Map();
  for (const report of reports) {
    if (latestReportsByProject.has(report.projectId)) continue;
    latestReportsByProject.set(report.projectId, {
      projectId: report.project.id,
      projectName: report.project.projectName,
      clientName: report.clientName || report.project.clientName || null,
      clientContactNumber: report.clientContactNumber || report.project.phone || null,
      department: 'Marketing',
      managers: (report.project.assignments || []).map((assignment) => assignment.manager?.name).filter(Boolean),
      report: {
        hasReport: true,
        reportId: report.id,
        isAdRunning: report.isAdRunning,
        typeOfAds: report.typeOfAds,
        areaName: report.areaName,
        todayReachObtained: report.todayReachObtained,
        todayAmountSpend: report.todayAmountSpend,
        leadObtained: report.leadObtained,
        videoLink: report.videoLink,
        reasonNotRunning: report.reasonNotRunning,
        clientName: report.clientName,
        clientContactNumber: report.clientContactNumber,
        submittedBy: report.manager?.name || null,
      },
    });
  }
  return [...latestReportsByProject.values()];
}

function formatCombinedClientMessage(group, date) {
  const divider = '━━━━━━━━━━━━━━━━━━━━';
  const marketingReports = group.marketing.filter((entry) => entry.report.hasReport);
  const totalSpend = marketingReports.reduce((sum, entry) => sum + Number(entry.report.todayAmountSpend || 0), 0);
  const totalReach = marketingReports.reduce((sum, entry) => sum + Number(entry.report.todayReachObtained || 0), 0);
  const totalLeads = marketingReports.reduce((sum, entry) => sum + Number(entry.report.leadObtained || 0), 0);
  const dateText = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const clientName = group.projects.find((project) => project.clientName)?.clientName ||
    group.projects[0]?.projectName || 'Client';
  const lines = [
    `Hello ${clientName},`,
    '',
    'Here is your complete daily report from We Promote.',
    '',
    `Yesterday add spent: ₹${totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Reach: ${totalReach.toLocaleString('en-IN')}`,
    `Leads Obtained: ${totalLeads.toLocaleString('en-IN')}`,
    '',
    divider,
  ];

  if (group.seo.length) {
    lines.push('', `🌐 SEO REPORT :${dateText}`, '');
    for (const { projectName, report } of group.seo) {
      lines.push(`Project: ${projectName}`);
      if (!report.hasReport) lines.push('No SEO report submitted today.');
      else {
        if (report.keywords?.length) lines.push(`Keywords: ${report.keywords.join(', ')}`);
        if (report.rankingNo != null) lines.push(`Ranking: #${report.rankingNo}`);
        if (report.remarks) lines.push(`Remarks: ${report.remarks}`);
      }
      lines.push('');
    }
    lines.push(divider);
  }

  if (group.marketing.length) {
    lines.push('', '📊 META ADS REPORT', '');
    for (const { projectName, report } of group.marketing) {
      lines.push(`Project: ${projectName}`);
      if (!report.hasReport) lines.push('No Meta Ads report submitted today.');
      else {
        if (report.typeOfAds) lines.push(`Platform: ${report.typeOfAds}`);
        if (report.areaName) lines.push(`Target Area: ${report.areaName}`);
        if (report.isAdRunning != null) lines.push(`Campaign Status: ${report.isAdRunning ? 'Running' : 'Not running'}`);
        lines.push(`Spend: ₹${Number(report.todayAmountSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        lines.push(`Reach: ${Number(report.todayReachObtained || 0).toLocaleString('en-IN')}`);
        lines.push(`Leads: ${Number(report.leadObtained || 0).toLocaleString('en-IN')}`);
      }
      lines.push('');
    }
    lines.push(divider);
  }

  if (group.socialMediaReports.length) {
    lines.push('', '📱 SOCIAL MEDIA REPORT', '');
    for (const { lastContentUploaded, nextExpectedUploadDate } of group.socialMediaReports) {
      lines.push(`Last Content Uploaded: ${lastContentUploaded || 'No content uploaded yet'}`);
      lines.push(`Next Expected Upload Date: ${nextExpectedUploadDate || 'Not scheduled'}`);
    }
    lines.push(divider);
  }

  const pendingTasks = [...new Map(group.pendingItems.map((item) => [
    `${item.dueDate.toISOString().slice(0, 10)}:${item.note.trim()}`,
    `${new Date(item.dueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })} — ${item.note.trim()}`,
  ])).values()];
  lines.push('', '📌 PENDING FROM YOUR SIDE');
  if (pendingTasks.length) {
    pendingTasks.forEach((task) => lines.push(`• ${task}`));
  } else {
    lines.push('• None');
  }
  lines.push('', divider, '', 'Thank you for choosing We Promote');
  return lines.join('\n');
}

/**
 * GET /api/whatsapp-messages/previews
 * Generate one client-ready message per normalized client phone number.
 */
exports.getMessagePreviews = async (req, res, next) => {
  try {
    const roles = (req.user.roles?.length ? req.user.roles : [req.user.role])
      .map((role) => String(role).toUpperCase());
    const role = roles.includes('ADMIN') ? 'ADMIN' : roles.includes('HR') ? 'HR' : 'MANAGER';
    const today = getDateKeyInIST();
    const yesterday = shiftDateKey(today, -1);
    const reportUser = { ...req.user, role };
    const [report, yesterdayMarketingReport, submittedMarketingReports] = await Promise.all([
      dailyReportService.getDailyReport(reportUser, { date: today, department: 'all' }),
      dailyReportService.getDailyReport(reportUser, { date: yesterday, department: 'marketing' }),
      getSubmittedMarketingReports(yesterday, reportUser),
    ]);
    const marketingByProjectId = new Map(
      yesterdayMarketingReport.marketing.map((entry) => [entry.projectId, entry])
    );
    submittedMarketingReports.forEach((entry) => marketingByProjectId.set(entry.projectId, entry));
    report.marketing = [...marketingByProjectId.values()];

    const groups = new Map();
    for (const [department, entries] of [
      ['seo', report.seo],
      ['marketing', report.marketing],
      ['socialMedia', report.socialMedia],
    ]) {
      for (const entry of entries) {
        const phone = entry.clientContactNumber || entry.report?.clientContactNumber || null;
        const phoneKey = normalizePhoneKey(phone);
        const groupId = phoneKey ? `phone:${phoneKey}` : `project:${entry.projectId}`;
        if (!groups.has(groupId)) {
          groups.set(groupId, {
            groupId,
            clientPhone: phone,
            isClientPhoneValid: Boolean(whatsappService.formatPhoneNumber(phone)),
            projects: [],
            pendingItems: [],
            managerNames: new Set(),
            seo: [],
            marketing: [],
            socialMedia: [],
          });
        }
        const group = groups.get(groupId);
        const isPhoneValid = Boolean(whatsappService.formatPhoneNumber(phone));
        if (isPhoneValid && !group.isClientPhoneValid) {
          group.clientPhone = phone;
          group.isClientPhoneValid = true;
        } else if (!group.clientPhone && phone) {
          group.clientPhone = phone;
        }
        if (!group.projects.some((project) => project.id === entry.projectId)) {
          group.projects.push({
            id: entry.projectId,
            projectName: entry.projectName,
            clientName: entry.clientName || entry.report?.clientName || null,
          });
        }
        entry.managers.forEach((manager) => group.managerNames.add(manager));
        group[department].push(entry);
      }
    }

    const grouped = [...groups.values()];
    await Promise.all(grouped.map(async (group) => {
      const socialProjects = group.socialMedia.map((entry) => ({
        id: entry.projectId,
        projectName: entry.projectName,
      }));
      const contentDates = await dailyReportService.getSocialMediaContentDates(socialProjects, today);
      group.socialMediaReports = group.socialMedia.map((socialMediaEntry) => {
        const dates = contentDates.get(socialMediaEntry.projectId);
        return {
          projectName: socialMediaEntry.projectName,
          lastContentUploaded: dates?.lastContentUploaded || 'No content uploaded yet',
          nextExpectedUploadDate: dates?.nextExpectedUploadDate || 'Not scheduled',
          contentCalendar: {
            ...socialMediaEntry.contentCalendar,
            lastContentUploaded: dates?.lastContentUploaded || 'No content uploaded yet',
            nextExpectedUploadDate: dates?.nextExpectedUploadDate || 'Not scheduled',
          },
          uploads: socialMediaEntry.uploads || { records: [] },
        };
      });
    }));
    const allProjectIds = [...new Set(grouped.flatMap((group) => group.projects.map((project) => project.id)))];
    const pendingItems = allProjectIds.length
      ? await prisma.projectPendingItem.findMany({
        where: { projectId: { in: allProjectIds } },
        select: { projectId: true, dueDate: true, note: true },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      })
      : [];
    const pendingItemsByProject = new Map();
    pendingItems.forEach((item) => {
      const items = pendingItemsByProject.get(item.projectId) || [];
      items.push(item);
      pendingItemsByProject.set(item.projectId, items);
    });
    const data = grouped.map((group) => {
      group.projects.forEach((project) => {
        group.pendingItems.push(...(pendingItemsByProject.get(project.id) || []));
      });
      const reportEntries = [...group.seo, ...group.marketing, ...group.socialMedia];
      return {
        groupId: group.groupId,
        projectIds: [...new Set(group.projects.map((project) => project.id))],
        projectNames: [...new Set(group.projects.map((project) => project.projectName))],
        clientName: group.projects.find((project) => project.clientName)?.clientName ||
          group.projects[0]?.projectName || 'Client',
        clientPhone: group.clientPhone,
        isClientPhoneValid: group.isClientPhoneValid,
        departmentNames: [...new Set(reportEntries.map((entry) => entry.department))],
        managerNames: [...group.managerNames],
        projects: group.projects,
        socialMediaReports: group.socialMediaReports.map(({ projectName, lastContentUploaded, nextExpectedUploadDate }) => ({
          projectName,
          lastContentUploaded,
          nextExpectedUploadDate,
        })),
        messageBody: formatCombinedClientMessage(group, today),
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

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
