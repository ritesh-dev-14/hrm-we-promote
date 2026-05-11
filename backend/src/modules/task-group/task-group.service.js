const prisma = require("../../config/prisma");

const ApiError = require("../../utils/ApiError");

const ERRORS = require("../../utils/errors");

//
// 🔥 CREATE GROUP
//
exports.createGroup = async (
  user,
  body
) => {
  const group =
    await prisma.taskGroup.create({
      data: {
        name: body.name,

        managerId: user.id,
      },
    });

  return group;
};

//
// 🔥 ADD MEMBERS
//
exports.addMembers = async (
  user,
  groupId,
  body
) => {
  // ✅ FIND GROUP
  const group =
    await prisma.taskGroup.findUnique({
      where: {
        id: groupId,
      },
    });

  if (!group) {
    throw new ApiError(
      404,
      "Group not found"
    );
  }

  // ✅ ONLY OWNER
  if (group.managerId !== user.id) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  // ✅ FIND EMPLOYEES
  const employees =
    await prisma.user.findMany({
      where: {
        employeeId: {
          in: body.employeeIds,
        },

        role: "EMPLOYEE",
      },
    });

  // ✅ VALIDATE
  if (
    employees.length !==
    body.employeeIds.length
  ) {
    throw new ApiError(
      400,
      "Some employees not found"
    );
  }

  // ✅ CREATE MEMBERS
  await prisma.taskGroupMember.createMany({
    data: employees.map((emp) => ({
      groupId,

      userId: emp.id,
    })),

    skipDuplicates: true,
  });

  return {
    success: true,

    message:
      "Members added successfully",
  };
};

//
// 🔥 GET GROUPS
//
exports.getGroups = async (user) => {
  return prisma.taskGroup.findMany({
    where: {
      managerId: user.id,
    },

    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,

              employeeId: true,

              name: true,

              role: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

//
// 🔥 GET SINGLE GROUP
//
exports.getGroupById = async (
  user,
  groupId
) => {
  const group =
    await prisma.taskGroup.findUnique({
      where: {
        id: groupId,
      },

      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,

                employeeId: true,

                name: true,

                role: true,
              },
            },
          },
        },
      },
    });

  if (!group) {
    throw new ApiError(
      404,
      "Group not found"
    );
  }

  if (group.managerId !== user.id) {
    throw new ApiError(
      403,
      ERRORS.AUTH.ACCESS_DENIED
    );
  }

  return group;
};