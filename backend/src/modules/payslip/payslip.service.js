const prisma = require("../../config/prisma");
const cloudinary = require("../../utils/cloudinary");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");
const mailService = require("../mail/mail.service");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getMonthName = (monthNumber) => {
  return MONTH_NAMES[monthNumber - 1] || `Month ${monthNumber}`;
};

exports.getUsersForPayslip = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      position: true,
      department: {
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return users;
};

exports.uploadPayslip = async ({ user: currentUser, file, body }) => {
  const { userId, title, remarks } = body;
  const month = parseInt(body.month, 10);
  const year = parseInt(body.year, 10);
  const sendEmail = body.sendEmail !== false && body.sendEmail !== "false";

  if (!file || !file.buffer) {
    throw new ApiError(400, ERRORS.PAYSLIP.IMAGE_REQUIRED);
  }

  // Check target employee by UUID id OR employeeId
  const targetEmployee = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userId },
        { employeeId: userId },
      ],
    },
    select: { id: true, name: true, email: true, employeeId: true },
  });

  if (!targetEmployee) {
    throw new ApiError(404, ERRORS.HR.EMPLOYEE_NOT_FOUND);
  }

  const targetUserId = targetEmployee.id;

  // Upload image to Cloudinary
  let uploadResult;
  try {
    uploadResult = await cloudinary.uploadBuffer(file.buffer, {
      folder: "payslips",
      resource_type: "image",
    });
  } catch (uploadErr) {
    throw new ApiError(500, {
      code: ERRORS.SERVER.INTERNAL_ERROR.code,
      message: `Payslip image upload failed: ${uploadErr.message}`,
    });
  }

  const imageUrl = uploadResult.secure_url;
  const publicId = uploadResult.public_id;
  const monthName = getMonthName(month);
  const payslipTitle = title || `Payslip for ${monthName} ${year}`;

  // Upsert Payslip record (unique per employee, month, year)
  const payslip = await prisma.payslip.upsert({
    where: {
      userId_month_year: {
        userId: targetUserId,
        month,
        year,
      },
    },
    update: {
      uploadedById: currentUser.id,
      title: payslipTitle,
      imageUrl,
      publicId,
      remarks: remarks || null,
      sentEmail: Boolean(sendEmail),
      updatedAt: new Date(),
    },
    create: {
      userId: targetUserId,
      uploadedById: currentUser.id,
      month,
      year,
      title: payslipTitle,
      imageUrl,
      publicId,
      remarks: remarks || null,
      sentEmail: Boolean(sendEmail),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          position: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // Create in-app notification for employee
  try {
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "New Payslip Uploaded",
        message: `Your payslip for ${monthName} ${year} has been uploaded.`,
        type: "GENERAL",
        entityId: payslip.id,
      },
    });
  } catch (notifErr) {
    console.warn(`[Payslip] Failed to create in-app notification: ${notifErr.message}`);
  }

  // Trigger email notification if enabled
  if (sendEmail && targetEmployee.email) {
    try {
      await mailService.sendPayslipEmail({
        email: targetEmployee.email,
        employeeName: targetEmployee.name,
        monthName,
        year,
        title: payslipTitle,
        remarks,
        imageUrl,
        uploaderName: currentUser.name || "HR",
      });
    } catch (mailErr) {
      console.warn(`[Payslip] Failed to send payslip email to ${targetEmployee.email}: ${mailErr.message}`);
    }
  }

  return payslip;
};

exports.getAllPayslips = async (query = {}) => {
  const { userId, month, year, search, page = 1, limit = 50 } = query;

  const where = {};

  if (userId) {
    where.userId = userId;
  }

  if (month) {
    where.month = parseInt(month, 10);
  }

  if (year) {
    where.year = parseInt(year, 10);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { remarks: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { employeeId: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [total, payslips] = await Promise.all([
    prisma.payslip.count({ where }),
    prisma.payslip.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            position: true,
            department: {
              select: { id: true, name: true },
            },
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    payslips,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

exports.getMyPayslips = async (currentUser, query = {}) => {
  const { month, year } = query;

  // Resolve user UUID and employeeId
  const userRecord = await prisma.user.findFirst({
    where: {
      OR: [
        ...(currentUser.id ? [{ id: currentUser.id }] : []),
        ...(currentUser.employeeId ? [{ employeeId: currentUser.employeeId }] : []),
      ],
    },
    select: { id: true, employeeId: true },
  });

  const userUuid = userRecord?.id || currentUser.id;
  const userEmpCode = userRecord?.employeeId || currentUser.employeeId;

  const where = {
    OR: [
      { userId: userUuid },
      ...(userEmpCode ? [{ userId: userEmpCode }] : []),
    ],
  };

  if (month) {
    where.month = parseInt(month, 10);
  }

  if (year) {
    where.year = parseInt(year, 10);
  }

  const payslips = await prisma.payslip.findMany({
    where,
    orderBy: [
      { year: "desc" },
      { month: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return payslips;
};

exports.getPayslipById = async (id, currentUser) => {
  const payslip = await prisma.payslip.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          position: true,
          department: {
            select: { id: true, name: true },
          },
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!payslip) {
    throw new ApiError(404, ERRORS.PAYSLIP.NOT_FOUND);
  }

  const isHR = ["ADMIN", "HR", "EA"].includes((currentUser.role || "").toUpperCase());
  if (!isHR && payslip.userId !== currentUser.id && payslip.userId !== currentUser.employeeId) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return payslip;
};

exports.updatePayslip = async ({ id, user: currentUser, file, body }) => {
  const existing = await prisma.payslip.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, ERRORS.PAYSLIP.NOT_FOUND);
  }

  const updateData = {};

  if (body.month) updateData.month = parseInt(body.month, 10);
  if (body.year) updateData.year = parseInt(body.year, 10);
  if (body.title !== undefined) updateData.title = body.title;
  if (body.remarks !== undefined) updateData.remarks = body.remarks;

  if (file && file.buffer) {
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploadBuffer(file.buffer, {
        folder: "payslips",
        resource_type: "image",
      });
      updateData.imageUrl = uploadResult.secure_url;
      updateData.publicId = uploadResult.public_id;
    } catch (uploadErr) {
      throw new ApiError(500, {
        code: ERRORS.SERVER.INTERNAL_ERROR.code,
        message: `Image re-upload failed: ${uploadErr.message}`,
      });
    }
  }

  const updatedPayslip = await prisma.payslip.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedPayslip;
};

exports.deletePayslip = async (id) => {
  const existing = await prisma.payslip.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, ERRORS.PAYSLIP.NOT_FOUND);
  }

  await prisma.payslip.delete({
    where: { id },
  });

  return { message: "Payslip deleted successfully" };
};
