const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");

const cloudinary = require("../../utils/cloudinary");

exports.submitReport = async (user, body, file) => {
  const { department, clients, weekNumber, year } = body;
  
  if (!file || !department || !weekNumber || !year) {
    throw new ApiError(400, "Missing required fields or audio file");
  }

  const uploadResult = await cloudinary.uploadBuffer(file.buffer, {
    folder: "weekly_voice_reports",
    resource_type: "video" // Cloudinary uses 'video' for audio files too
  });

  const report = await prisma.weeklyVoiceReport.create({
    data: {
      managerId: user.id,
      department,
      audioUrl: uploadResult.secure_url,
      weekNumber: parseInt(weekNumber),
      year: parseInt(year),
      clients: clients ? JSON.parse(clients) : []
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
  return prisma.weeklyVoiceReport.findMany({
    where: { managerId: user.id },
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAllReports = async (query) => {
  const { department, weekNumber, year } = query;
  const where = {};
  
  if (department) where.department = department;
  if (weekNumber) where.weekNumber = parseInt(weekNumber);
  if (year) where.year = parseInt(year);

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
