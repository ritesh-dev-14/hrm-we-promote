const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const ERRORS = require("../../utils/errors");

const canManageUploads = (role) => ["HR", "MANAGER"].includes((role || "").toUpperCase());

exports.createUpload = async (user, body) => {
  if (!canManageUploads(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const upload = await prisma.upload.create({
    data: {
      projectName: body.projectName,
      uploadDate: new Date(body.uploadDate),
      clientName: body.clientName,
      totalUploads: Number(body.totalUploads || 0),
      createdById: user.id,
      items: {
        create: (body.items || []).map((item) => ({
          dataType: item.dataType,
          platform: item.platform || null,
        })),
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
    },
  });

  return upload;
};

exports.getAllUploads = async (user, query = {}) => {
  if (!user || !user.role) {
    throw new ApiError(401, ERRORS.AUTH.UNAUTHORIZED);
  }

  const allowed = ["HR", "MANAGER", "EMPLOYEE", "COORDINATOR", "EA"];
  if (!allowed.includes((user.role || "").toUpperCase())) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const uploads = await prisma.upload.findMany({
    orderBy: [{ uploadDate: "desc" }, { createdAt: "desc" }],
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
    },
  });

  return uploads;
};

exports.getUploadById = async (user, id) => {
  if (!user || !user.role) {
    throw new ApiError(401, ERRORS.AUTH.UNAUTHORIZED);
  }

  const upload = await prisma.upload.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
    },
  });

  if (!upload) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Upload entry not found.",
    });
  }

  if (!canManageUploads(user.role) && !["EMPLOYEE", "COORDINATOR", "EA"].includes((user.role || "").toUpperCase())) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  return upload;
};

exports.updateUpload = async (user, id, body) => {
  if (!canManageUploads(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existing = await prisma.upload.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Upload entry not found.",
    });
  }

  const updateData = {};
  if (body.projectName !== undefined) updateData.projectName = body.projectName;
  if (body.uploadDate !== undefined) updateData.uploadDate = new Date(body.uploadDate);
  if (body.clientName !== undefined) updateData.clientName = body.clientName;
  if (body.totalUploads !== undefined) updateData.totalUploads = Number(body.totalUploads);

  const upload = await prisma.$transaction(async (tx) => {
    const updated = await tx.upload.update({
      where: { id },
      data: updateData,
      include: { createdBy: { select: { id: true, name: true, email: true, role: true } }, items: true },
    });

    if (Array.isArray(body.items)) {
      const incomingIds = body.items.filter((item) => item.id).map((item) => item.id);
      await tx.uploadItem.deleteMany({ where: { uploadId: id, NOT: { id: { in: incomingIds } } } });

      for (const item of body.items) {
        if (item.id) {
          await tx.uploadItem.update({
            where: { id: item.id },
            data: { dataType: item.dataType, platform: item.platform || null },
          });
        } else {
          await tx.uploadItem.create({
            data: {
              uploadId: id,
              dataType: item.dataType,
              platform: item.platform || null,
            },
          });
        }
      }
    }

    return tx.upload.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true, role: true } }, items: true },
    });
  });

  return upload;
};

exports.deleteUpload = async (user, id) => {
  if (!canManageUploads(user.role)) {
    throw new ApiError(403, ERRORS.AUTH.ACCESS_DENIED);
  }

  const existing = await prisma.upload.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, {
      code: ERRORS.VALIDATION.INVALID_INPUT.code,
      message: "Upload entry not found.",
    });
  }

  await prisma.upload.delete({ where: { id } });

  return { message: "Upload entry deleted successfully" };
};
