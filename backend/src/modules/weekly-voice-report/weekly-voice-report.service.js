const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const cloudinary = require("../../utils/cloudinary");

exports.submitReport = async (user, body, files, singleFile) => {
  const { department, clients, weekNumber, year, reportType: requestedReportType, reason } = body;
  
  if (!department || !weekNumber || !year) {
    throw new ApiError(400, "Missing required fields (department, weekNumber, year)");
  }

  // Extract audio file if provided
  const audioFile =
    singleFile ||
    files?.audio?.[0] ||
    (Array.isArray(files)
      ? files.find((f) => f.fieldname === "audio" || f.mimetype.startsWith("audio/"))
      : null);

  // Extract screenshot files if provided
  let screenshotFiles = [];
  if (files?.screenshots) {
    screenshotFiles = Array.isArray(files.screenshots) ? files.screenshots : [files.screenshots];
  } else if (Array.isArray(files)) {
    screenshotFiles = files.filter(
      (f) =>
        f.fieldname === "screenshots" ||
        f.fieldname === "screenshots[]" ||
        f.mimetype.startsWith("image/")
    );
  }

  // Determine report type
  let reportType = requestedReportType;
  if (!reportType) {
    if (audioFile) {
      reportType = "VOICE";
    } else if (screenshotFiles.length > 0) {
      reportType = "SCREENSHOTS";
    } else {
      throw new ApiError(400, "Please provide either a voice recording, conversation screenshots, or reason why unable to submit.");
    }
  }

  let audioUrl = null;
  let screenshotUrls = [];

  if (reportType === "UNABLE_TO_SUBMIT") {
    if (!reason || !reason.trim()) {
      throw new ApiError(400, "Please provide a reason explaining why you are unable to submit the report.");
    }
  } else if (reportType === "VOICE") {
    if (!audioFile) {
      throw new ApiError(400, "Please upload a voice recording audio file.");
    }
    const uploadResult = await cloudinary.uploadBuffer(audioFile.buffer, {
      folder: "weekly_voice_reports",
      resource_type: "video" // Cloudinary uses 'video' for audio files
    });
    audioUrl = uploadResult.secure_url;
  } else if (reportType === "SCREENSHOTS") {
    if (!screenshotFiles || screenshotFiles.length === 0) {
      throw new ApiError(400, "Please upload at least one conversation screenshot.");
    }
    const uploadPromises = screenshotFiles.map((file) =>
      cloudinary.uploadBuffer(file.buffer, {
        folder: "weekly_voice_reports/screenshots",
        resource_type: "image"
      })
    );
    const results = await Promise.all(uploadPromises);
    screenshotUrls = results.map((r) => r.secure_url);
  } else {
    throw new ApiError(400, "Invalid report type. Expected 'VOICE', 'SCREENSHOTS', or 'UNABLE_TO_SUBMIT'.");
  }

  const rawClients = clients
    ? typeof clients === "string"
      ? JSON.parse(clients)
      : clients
    : [];

  const parsedClients = rawClients.map((c) => ({
    ...c,
    ...(reason && reason.trim() ? { reason: reason.trim() } : {})
  }));

  // Check if an existing report for this manager, weekNumber, year, and client exists (Revision / Re-submit)
  const targetClientId = parsedClients[0]?.id;
  let existingReport = null;

  if (targetClientId) {
    const candidateReports = await prisma.weeklyVoiceReport.findMany({
      where: {
        managerId: user.id,
        weekNumber: parseInt(weekNumber),
        year: parseInt(year)
      }
    });

    existingReport = candidateReports.find((r) => {
      const cls = Array.isArray(r.clients)
        ? r.clients
        : typeof r.clients === "string"
        ? JSON.parse(r.clients)
        : [];
      return cls.some((c) => String(c.id) === String(targetClientId));
    });
  }

  if (existingReport) {
    return prisma.weeklyVoiceReport.update({
      where: { id: existingReport.id },
      data: {
        department,
        reportType,
        audioUrl: reportType === "VOICE" ? audioUrl : null,
        screenshots: reportType === "SCREENSHOTS" && screenshotUrls.length > 0 ? screenshotUrls : null,
        status: reportType === "UNABLE_TO_SUBMIT" ? "Unable to Submit" : "Submitted",
        qaStatus: "PENDING", // Resets QA review back to PENDING so QA reviews the updated submission!
        qaFeedback: null,    // Clears the revision feedback
        qaReviewedAt: null,
        qaReviewerId: null,
        clients: parsedClients,
        updatedAt: new Date()
      }
    });
  }

  const report = await prisma.weeklyVoiceReport.create({
    data: {
      managerId: user.id,
      department,
      reportType,
      audioUrl,
      screenshots: screenshotUrls.length > 0 ? screenshotUrls : null,
      status: reportType === "UNABLE_TO_SUBMIT" ? "Unable to Submit" : "Submitted",
      qaStatus: "PENDING",
      weekNumber: parseInt(weekNumber),
      year: parseInt(year),
      clients: parsedClients
    }
  });

  return report;
};

exports.getActiveClients = async (user) => {
  const assignments = await prisma.projectAssignment.findMany({
    where: { managerId: user.id },
    include: {
      project: {
        include: {
          department: true,
        },
      },
    },
  });

  return assignments
    .map(a => a.project)
    .filter(p => p.isRunning === true || p.status === 'ONGOING');
};

exports.getMyReports = async (user, query) => {
  const { weekNumber, year } = query || {};
  const where = { managerId: user.id };
  if (weekNumber) where.weekNumber = parseInt(weekNumber);
  if (year) where.year = parseInt(year);

  return prisma.weeklyVoiceReport.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAllReports = async (query) => {
  const { department, weekNumber, year, reportType } = query;
  const where = {};
  
  if (department) where.department = department;
  if (weekNumber) where.weekNumber = parseInt(weekNumber);
  if (year) where.year = parseInt(year);
  if (reportType) where.reportType = reportType;

  return prisma.weeklyVoiceReport.findMany({
    where,
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.getQAMetaAdsTracking = async (query) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const year = query.year ? parseInt(query.year) : currentYear;
  const month = query.month ? parseInt(query.month) : currentMonth;

  // Month metadata
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const months = monthNames.map((name, idx) => ({
    monthIndex: idx + 1,
    name,
    isCurrent: year === currentYear && idx + 1 === currentMonth
  }));

  // Calculate weeks for the selected month
  const monthIndex = month - 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOfYear = new Date(year, 0, 1);

  const getWeekNum = (date) => {
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.max(1, Math.ceil(days / 7));
  };

  const weekChunks = [
    { startDay: 1, endDay: 7, label: "Week 1" },
    { startDay: 8, endDay: 14, label: "Week 2" },
    { startDay: 15, endDay: 21, label: "Week 3" },
    { startDay: 22, endDay: 28, label: "Week 4" },
  ];
  if (daysInMonth > 28) {
    weekChunks.push({ startDay: 29, endDay: daysInMonth, label: "Week 5" });
  }

  // Get active Meta Ads projects
  const activeProjects = await prisma.project.findMany({
    where: {
      OR: [
        { isRunning: true },
        { status: "ONGOING" }
      ],
      department: {
        name: {
          in: ["Marketing", "Marketing Department", "Meta Ads", "Meta Ads Department"]
        }
      }
    },
    include: {
      assignments: {
        include: {
          manager: {
            select: { id: true, name: true, email: true, employeeId: true }
          }
        }
      }
    },
    orderBy: { projectName: "asc" }
  });

  // Calculate weekNumbers for each chunk
  const weekNumbers = weekChunks.map((c) => {
    const sampleDate = new Date(year, monthIndex, Math.min(c.startDay + 3, daysInMonth));
    return getWeekNum(sampleDate);
  });

  // Fetch all reports for the target weeks in this year
  const rawReports = await prisma.weeklyVoiceReport.findMany({
    where: {
      year,
      weekNumber: { in: weekNumbers }
    },
    include: {
      manager: {
        select: { id: true, name: true, email: true, employeeId: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Fetch QA reviewers if any
  const reviewerIds = [...new Set(rawReports.map((r) => r.qaReviewerId).filter(Boolean))];
  const reviewers = reviewerIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: reviewerIds } },
        select: { id: true, name: true, email: true }
      })
    : [];
  const reviewerMap = new Map(reviewers.map((u) => [u.id, u]));

  const reports = rawReports.map((r) => ({
    ...r,
    qaReviewer: r.qaReviewerId ? reviewerMap.get(r.qaReviewerId) || null : null
  }));

  // Build weekly summaries
  const weeks = weekChunks.map((c, idx) => {
    const sampleDate = new Date(year, monthIndex, Math.min(c.startDay + 3, daysInMonth));
    const weekNum = getWeekNum(sampleDate);

    const weekReports = reports.filter((r) => r.weekNumber === weekNum);

    // Map which projects are submitted in this week
    const submittedProjects = [];
    const submittedProjectIds = new Set();

    weekReports.forEach((report) => {
      const clientList = Array.isArray(report.clients)
        ? report.clients
        : typeof report.clients === "string"
        ? JSON.parse(report.clients)
        : [];

      clientList.forEach((cl) => {
        if (cl?.id && !submittedProjectIds.has(String(cl.id))) {
          submittedProjectIds.add(String(cl.id));
          const projectMatch = activeProjects.find((p) => String(p.id) === String(cl.id));
          submittedProjects.push({
            projectId: cl.id,
            projectName: cl.name || projectMatch?.projectName || projectMatch?.clientName || "Unknown Project",
            project: projectMatch || null,
            reportId: report.id,
            reportType: report.reportType,
            audioUrl: report.audioUrl,
            screenshots: report.screenshots || [],
            status: report.status,
            reason: cl.reason || (report.reportType === "UNABLE_TO_SUBMIT" ? report.status : null),
            qaStatus: report.qaStatus || "PENDING",
            qaFeedback: report.qaFeedback,
            qaReviewedAt: report.qaReviewedAt,
            qaReviewer: report.qaReviewer,
            submittedAt: report.updatedAt || report.createdAt,
            manager: report.manager
          });
        }
      });
    });

    // Unsubmitted projects
    const unsubmittedProjects = activeProjects
      .filter((p) => !submittedProjectIds.has(String(p.id)))
      .map((p) => ({
        projectId: p.id,
        projectName: p.projectName || p.clientName,
        clientName: p.clientName,
        status: p.status,
        manager: p.assignments?.[0]?.manager || null
      }));

    return {
      weekIndex: idx + 1,
      weekLabel: c.label,
      weekNumber: weekNum,
      startDay: c.startDay,
      endDay: c.endDay,
      startDate: new Date(year, monthIndex, c.startDay).toISOString(),
      endDate: new Date(year, monthIndex, c.endDay).toISOString(),
      stats: {
        totalProjects: activeProjects.length,
        submittedCount: submittedProjects.length,
        unsubmittedCount: unsubmittedProjects.length,
        approvedCount: submittedProjects.filter((sp) => sp.qaStatus === "APPROVED").length,
        rejectedCount: submittedProjects.filter((sp) => sp.qaStatus === "REJECTED").length,
        pendingReviewCount: submittedProjects.filter((sp) => sp.qaStatus === "PENDING").length,
        unableToSubmitCount: submittedProjects.filter((sp) => sp.reportType === "UNABLE_TO_SUBMIT" || sp.status === "Unable to Submit").length
      },
      submittedProjects,
      unsubmittedProjects
    };
  });

  return {
    year,
    selectedMonth: month,
    monthName: monthNames[monthIndex],
    months,
    weeks,
    totalActiveProjects: activeProjects.length
  };
};

exports.reviewReportByQA = async (reportId, user, body) => {
  const { qaStatus, qaFeedback } = body;
  if (!["APPROVED", "REJECTED", "PENDING"].includes(qaStatus)) {
    throw new ApiError(400, "qaStatus must be APPROVED, REJECTED, or PENDING");
  }

  const existing = await prisma.weeklyVoiceReport.findUnique({
    where: { id: reportId }
  });
  if (!existing) {
    throw new ApiError(404, "Weekly report not found");
  }

  const updated = await prisma.weeklyVoiceReport.update({
    where: { id: reportId },
    data: {
      qaStatus,
      qaFeedback: qaFeedback !== undefined ? qaFeedback : existing.qaFeedback,
      qaReviewedAt: new Date(),
      qaReviewerId: user.id
    },
    include: {
      manager: {
        select: { id: true, name: true, email: true, employeeId: true }
      }
    }
  });

  const reviewer = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true }
  });

  return {
    ...updated,
    qaReviewer: reviewer || null
  };
};
