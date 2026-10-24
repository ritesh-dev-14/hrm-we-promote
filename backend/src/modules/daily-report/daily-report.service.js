const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const ERRORS = require('../../utils/errors');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a date string or Date object into start/end of that day (IST-aware).
 */
function getDayRange(date) {
  const dateKey = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : getDateKeyInIST(date || new Date());
  const startOfDay = new Date(`${dateKey}T00:00:00+05:30`);
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);

  return { startOfDay, endOfDay };
}

/**
 * Format a date as YYYY-MM-DD string.
 */
function toDateString(date) {
  return getDateKeyInIST(date);
}

function getDateKeyInIST(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const dateParts = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function formatSocialDate(value) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
    : null;
}

exports.getSocialMediaContentDates = async (projects, referenceDate = new Date()) => {
  if (!projects.length) return new Map();

  const projectIds = projects.map((project) => project.id);
  const projectNames = [...new Set(projects.map((project) => project.projectName).filter(Boolean))];
  const referenceDateKey = getDateKeyInIST(referenceDate);

  const [calendarDays, uploads] = await Promise.all([
    prisma.projectMonthlySheetDay.findMany({
      where: { sheet: { projectId: { in: projectIds } } },
      select: {
        date: true,
        reelType: true,
        postType: true,
        videoType: true,
        uploadStatus: true,
        contentUploadLinks: true,
        videoUploadLinks: true,
        sheet: { select: { projectId: true } },
      },
      orderBy: { date: 'asc' },
    }),
    projectNames.length
      ? prisma.upload.findMany({
        where: {
          projectName: { in: projectNames, mode: 'insensitive' },
          OR: [
            { totalUploads: { gt: 0 } },
            { items: { some: {} } },
          ],
        },
        select: { projectName: true, uploadDate: true },
        orderBy: [{ uploadDate: 'desc' }, { createdAt: 'desc' }],
      })
      : [],
  ]);

  const projectIdByName = new Map(
    projects.map((project) => [String(project.projectName || '').toLowerCase().trim(), project.id]),
  );
  const lastUploadDateByProject = new Map();
  uploads.forEach((upload) => {
    const projectId = projectIdByName.get(String(upload.projectName || '').toLowerCase().trim());
    if (projectId && !lastUploadDateByProject.has(projectId)) {
      lastUploadDateByProject.set(projectId, upload.uploadDate);
    }
  });

  const nextUploadDateByProject = new Map();
  calendarDays.forEach((day) => {
    const projectId = day.sheet.projectId;
    const dayKey = getDateKeyInIST(day.date);
    const hasCalendarContent = day.reelType || day.postType || day.videoType;
    const hasUploadedLinks = [...(day.videoUploadLinks || []), ...(day.contentUploadLinks || [])]
      .some((link) => String(link || '').trim());

    if (day.uploadStatus === 'APPROVED' && hasUploadedLinks) {
      const lastUploadDate = lastUploadDateByProject.get(projectId);
      if (!lastUploadDate || dayKey > getDateKeyInIST(lastUploadDate)) {
        lastUploadDateByProject.set(projectId, day.date);
      }
    }

    if (
      hasCalendarContent
      && dayKey >= referenceDateKey
      && day.uploadStatus !== 'APPROVED'
      && !nextUploadDateByProject.has(projectId)
    ) {
      nextUploadDateByProject.set(projectId, day.date);
    }
  });

  return new Map(projects.map((project) => {
    const lastUploadDate = lastUploadDateByProject.get(project.id);
    const nextUploadDate = nextUploadDateByProject.get(project.id);
    return [project.id, {
      lastContentUploaded: formatSocialDate(lastUploadDate) || 'No content uploaded yet',
      nextExpectedUploadDate: formatSocialDate(nextUploadDate) || 'Not scheduled',
      hasSocialMediaData: Boolean(lastUploadDate || nextUploadDate),
    }];
  }));
};

// ─── Social Media ──────────────────────────────────────────────────────────────

async function getSocialMediaReport(projects, startOfDay, endOfDay) {
  const projectNames = projects.map((p) => p.projectName);

  // Batch fetch all monthly sheet days for today across all projects
  const sheetDays = await prisma.projectMonthlySheetDay.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      sheet: {
        projectId: { in: projects.map((p) => p.id) },
      },
    },
    include: {
      sheet: { select: { projectId: true, month: true, year: true } },
    },
  });

  // Batch fetch uploads by project name for today
  const todayUploads = await prisma.upload.findMany({
    where: {
      uploadDate: { gte: startOfDay, lte: endOfDay },
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  const contentDates = await exports.getSocialMediaContentDates(projects, startOfDay);

  // Index by projectId and projectName (lowercased)
  const sheetDayByProjectId = {};
  sheetDays.forEach((day) => {
    sheetDayByProjectId[day.sheet.projectId] = day;
  });

  const uploadsByProjectName = {};
  todayUploads.forEach((upload) => {
    const key = (upload.projectName || '').toLowerCase().trim();
    if (!uploadsByProjectName[key]) uploadsByProjectName[key] = [];
    uploadsByProjectName[key].push(upload);
  });

  return projects.map((project) => {
    const sheetDay = sheetDayByProjectId[project.id] || null;
    const matchedUploads = uploadsByProjectName[(project.projectName || '').toLowerCase().trim()] || [];

    const managers = (project.assignments || [])
      .map((a) => a.manager?.name)
      .filter(Boolean);

    // Build content type string
    const contentTypes = [];
    if (sheetDay?.reelType) contentTypes.push(`Reel (${sheetDay.reelType})`);
    if (sheetDay?.postType) contentTypes.push(`Post (${sheetDay.postType})`);
    if (sheetDay?.videoType) contentTypes.push(`Video (${sheetDay.videoType})`);

    const totalUploadItems = matchedUploads.reduce((sum, u) => sum + (u.totalUploads || 0), 0);

    return {
      projectId: project.id,
      projectName: project.projectName,
      clientName: project.clientName || null,
      clientContactNumber: project.phone || null,
      department: project.department?.name || 'Social Media',
      managers,
      contentCalendar: {
        hasEntry: !!sheetDay,
        uploadStatus: sheetDay?.uploadStatus || null,
        contentType: contentTypes.join(' + ') || null,
        title: sheetDay?.title || null,
        description: sheetDay?.description || null,
        submissionLinks: sheetDay?.submissionLinks || [],
        contentUploadLinks: sheetDay?.contentUploadLinks || [],
        videoUploadLinks: sheetDay?.videoUploadLinks || [],
        rejectReason: sheetDay?.uploadRejectReason || null,
        ...contentDates.get(project.id),
      },
      uploads: {
        hasUploads: matchedUploads.length > 0,
        totalUploads: totalUploadItems,
        records: matchedUploads.map((u) => ({
          id: u.id,
          totalUploads: u.totalUploads,
          items: (u.items || []).map((i) => ({
            dataType: i.dataType,
            platform: i.platform || null,
          })),
        })),
      },
    };
  });
}

// ─── SEO ───────────────────────────────────────────────────────────────────────

async function getSeoReport(projects, startOfDay, endOfDay) {
  const seoReports = await prisma.seoReport.findMany({
    where: {
      projectId: { in: projects.map((p) => p.id) },
      checkDate: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      manager: { select: { id: true, name: true } },
    },
    orderBy: { checkDate: 'desc' },
  });

  const reportByProjectId = {};
  seoReports.forEach((r) => {
    if (!reportByProjectId[r.projectId]) reportByProjectId[r.projectId] = r;
  });

  return projects.map((project) => {
    const report = reportByProjectId[project.id] || null;
    const managers = (project.assignments || [])
      .map((a) => a.manager?.name)
      .filter(Boolean);

    return {
      projectId: project.id,
      projectName: project.projectName,
      clientName: project.clientName || null,
      clientContactNumber: report?.clientContactNumber || project.phone || null,
      department: project.department?.name || 'SEO',
      managers,
      report: {
        hasReport: !!report,
        reportId: report?.id || null,
        keywords: report?.keywords || [],
        rankingNo: report?.rankingNo ?? null,
        sheetUrl: report?.sheetUrl || null,
        checkDate: report?.checkDate || null,
        screenshotUrl: report?.screenshotUrl || null,
        remarks: report?.remarks || null,
        clientContactNumber: report?.clientContactNumber || null,
        submittedBy: report?.manager?.name || null,
      },
    };
  });
}

// ─── Marketing ─────────────────────────────────────────────────────────────────

async function getMarketingReport(projects, startOfDay, endOfDay) {
  const marketingReports = await prisma.marketingReport.findMany({
    where: {
      projectId: { in: projects.map((p) => p.id) },
      date: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      manager: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
  });

  const reportByProjectId = {};
  marketingReports.forEach((r) => {
    if (!reportByProjectId[r.projectId]) reportByProjectId[r.projectId] = r;
  });

  return projects.map((project) => {
    const report = reportByProjectId[project.id] || null;
    const managers = (project.assignments || [])
      .map((a) => a.manager?.name)
      .filter(Boolean);

    return {
      projectId: project.id,
      projectName: project.projectName,
      clientName: project.clientName || null,
      clientContactNumber: report?.clientContactNumber || project.phone || null,
      department: project.department?.name || 'Marketing',
      managers,
      report: {
        hasReport: !!report,
        reportId: report?.id || null,
        isAdRunning: report?.isAdRunning ?? null,
        typeOfAds: report?.typeOfAds || null,
        areaName: report?.areaName || null,
        todayReachObtained: report?.todayReachObtained ?? null,
        todayAmountSpend: report?.todayAmountSpend ?? null,
        leadObtained: report?.leadObtained ?? null,
        videoLink: report?.videoLink || null,
        reasonNotRunning: report?.reasonNotRunning || null,
        clientName: report?.clientName || null,
        clientContactNumber: report?.clientContactNumber || null,
        submittedBy: report?.manager?.name || null,
      },
    };
  });
}

// ─── Main Service ──────────────────────────────────────────────────────────────

/**
 * Get the unified daily department report.
 *
 * @param {object} user        - req.user (id, role)
 * @param {object} filters     - { date, department, projectId }
 * @returns {Promise<object>}
 */
exports.getDailyReport = async (user, filters = {}) => {
  const allowedRoles = ['ADMIN', 'HR', 'MANAGER'];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const { date, department = 'all', projectId } = filters;
  const { startOfDay, endOfDay } = getDayRange(date);
  const dateStr = toDateString(startOfDay);

  // ── Build base project filter ─────────────────────────────────────────────

  // Dept name filters
  const socialMediaFilter = { department: { name: { contains: 'social media', mode: 'insensitive' } } };
  const seoFilter         = { department: { name: { contains: 'seo',          mode: 'insensitive' } } };
  const marketingFilter   = { department: { name: { contains: 'marketing',    mode: 'insensitive' } } };

  const deptConditions = [];
  if (department === 'all' || department === 'social_media') deptConditions.push(socialMediaFilter);
  if (department === 'all' || department === 'seo')          deptConditions.push(seoFilter);
  if (department === 'all' || department === 'marketing')    deptConditions.push(marketingFilter);

  const baseWhere = {
    OR: deptConditions,
    ...(projectId ? { id: projectId } : {}),
  };

  // Manager can only see their assigned projects
  if (user.role === 'MANAGER') {
    baseWhere.assignments = {
      some: { managerId: user.id },
    };
  }

  // ── Fetch all matching projects ───────────────────────────────────────────

  const allProjects = await prisma.project.findMany({
    where: baseWhere,
    include: {
      department: { select: { name: true } },
      assignments: {
        select: {
          managerId: true,
          manager: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { projectName: 'asc' },
  });

  // ── Split by department type ──────────────────────────────────────────────

  const socialMediaProjects = allProjects.filter((p) =>
    (p.department?.name || '').toLowerCase().includes('social media')
  );
  const seoProjects = allProjects.filter((p) =>
    (p.department?.name || '').toLowerCase().includes('seo')
  );
  const marketingProjects = allProjects.filter((p) =>
    (p.department?.name || '').toLowerCase().includes('marketing')
  );

  // ── Fetch department reports in parallel ──────────────────────────────────

  const [socialMediaData, seoData, marketingData] = await Promise.all([
    (department === 'all' || department === 'social_media') && socialMediaProjects.length > 0
      ? getSocialMediaReport(socialMediaProjects, startOfDay, endOfDay)
      : Promise.resolve([]),

    (department === 'all' || department === 'seo') && seoProjects.length > 0
      ? getSeoReport(seoProjects, startOfDay, endOfDay)
      : Promise.resolve([]),

    (department === 'all' || department === 'marketing') && marketingProjects.length > 0
      ? getMarketingReport(marketingProjects, startOfDay, endOfDay)
      : Promise.resolve([]),
  ]);

  // ── Build summary stats ───────────────────────────────────────────────────

  const smSubmitted    = socialMediaData.filter((p) => p.contentCalendar.hasEntry || p.uploads.hasUploads).length;
  const seoSubmitted   = seoData.filter((p) => p.report.hasReport).length;
  const mktSubmitted   = marketingData.filter((p) => p.report.hasReport).length;

  return {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    summary: {
      totalProjects: allProjects.length,
      socialMedia: {
        total: socialMediaProjects.length,
        submitted: smSubmitted,
        pending: socialMediaProjects.length - smSubmitted,
      },
      seo: {
        total: seoProjects.length,
        submitted: seoSubmitted,
        pending: seoProjects.length - seoSubmitted,
      },
      marketing: {
        total: marketingProjects.length,
        submitted: mktSubmitted,
        pending: marketingProjects.length - mktSubmitted,
      },
    },
    socialMedia: socialMediaData,
    seo: seoData,
    marketing: marketingData,
  };
};
