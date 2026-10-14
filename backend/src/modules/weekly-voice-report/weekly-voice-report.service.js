const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const cloudinary = require("../../utils/cloudinary");

exports.submitReport = async (user, body, files, singleFile) => {
  const { department, clients, weekNumber, year, reportType: requestedReportType } = body;
  
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
      throw new ApiError(400, "Please provide either a voice recording or conversation screenshots.");
    }
  }

  let audioUrl = null;
  let screenshotUrls = [];

  if (reportType === "VOICE") {
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
    throw new ApiError(400, "Invalid report type. Expected 'VOICE' or 'SCREENSHOTS'.");
  }

  const parsedClients = clients
    ? typeof clients === "string"
      ? JSON.parse(clients)
      : clients
    : [];

  const report = await prisma.weeklyVoiceReport.create({
    data: {
      managerId: user.id,
      department,
      reportType,
      audioUrl,
      screenshots: screenshotUrls.length > 0 ? screenshotUrls : null,
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
    include: { project: true }
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
