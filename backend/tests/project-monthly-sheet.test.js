const test = require("node:test");
const assert = require("node:assert/strict");

const prisma = require("../src/config/prisma");
const service = require("../src/modules/project-monthly-sheet/project-monthly-sheet.service");
const { updateProjectMonthlySheetSchema } = require("../src/modules/project-monthly-sheet/project-monthly-sheet.validation");

const sheetId = "sheet-1";
const projectId = "project-1";
const manager = { id: "manager-1", role: "MANAGER" };
const dayDate = new Date("2026-11-01T00:00:00.000Z");

const makeDay = (id) => ({
  id,
  date: dayDate,
  reelType: null,
  postType: null,
  videoType: null,
  title: null,
  referenceLinks: [],
  submissionLinks: [],
  contentUploadLinks: [],
  videoUploadLinks: [],
  script: null,
  description: null,
  uploadStatus: "PENDING",
  uploadRejectReason: null,
  uploadRetryDate: null,
  uploadedAt: null,
  createdAt: dayDate,
});

const mockUpdate = (remainingDays) => {
  const originals = {
    projectFindUnique: prisma.project.findUnique,
    sheetFindFirst: prisma.projectMonthlySheet.findFirst,
    sheetFindUnique: prisma.projectMonthlySheet.findUnique,
    sheetUpdate: prisma.projectMonthlySheet.update,
    dayUpdate: prisma.projectMonthlySheetDay.update,
    dayDeleteMany: prisma.projectMonthlySheetDay.deleteMany,
  };
  let deleteManyArgs;
  let sheetUpdateCalls = 0;

  prisma.project.findUnique = async () => ({
    department: { name: "Social Media" },
    assignments: [{ managerId: manager.id }],
  });
  prisma.projectMonthlySheet.findFirst = async () => ({
    id: sheetId,
    projectId,
    days: [makeDay("keep-day"), makeDay("removed-day")],
  });
  prisma.projectMonthlySheetDay.update = async () => ({});
  prisma.projectMonthlySheetDay.deleteMany = async (args) => {
    deleteManyArgs = args;
    return { count: 1 };
  };
  prisma.projectMonthlySheet.findUnique = async () => ({
    id: sheetId,
    days: remainingDays,
  });
  prisma.projectMonthlySheet.update = async () => {
    sheetUpdateCalls += 1;
    if (sheetUpdateCalls === 1) return {};
    return {
      id: sheetId,
      projectId,
      month: 11,
      year: 2026,
      totalReels: 0,
      totalPosts: 0,
      moodBoardLink: "",
      createdBy: { id: manager.id, employeeId: "M001", name: "Manager", role: "MANAGER" },
      days: remainingDays,
      createdAt: dayDate,
      updatedAt: dayDate,
    };
  };

  return {
    getDeleteManyArgs: () => deleteManyArgs,
    restore: () => {
      prisma.project.findUnique = originals.projectFindUnique;
      prisma.projectMonthlySheet.findFirst = originals.sheetFindFirst;
      prisma.projectMonthlySheet.findUnique = originals.sheetFindUnique;
      prisma.projectMonthlySheet.update = originals.sheetUpdate;
      prisma.projectMonthlySheetDay.update = originals.dayUpdate;
      prisma.projectMonthlySheetDay.deleteMany = originals.dayDeleteMany;
    },
  };
};

test("updating a monthly sheet deletes rows omitted from the submitted calendar", async () => {
  const mocks = mockUpdate([makeDay("keep-day")]);

  try {
    const updated = await service.updateProjectMonthlySheet(manager, projectId, sheetId, {
      days: [{ id: "keep-day", date: dayDate.toISOString() }],
    });

    assert.deepEqual(mocks.getDeleteManyArgs(), {
      where: { sheetId, id: { notIn: ["keep-day"] } },
    });
    assert.deepEqual(updated.days.map((day) => day.id), ["keep-day"]);
  } finally {
    mocks.restore();
  }
});

test("monthly sheet updates allow removing every calendar row", async () => {
  const mocks = mockUpdate([]);

  try {
    const validation = updateProjectMonthlySheetSchema.validate({ days: [] });
    assert.equal(validation.error, undefined);

    const updated = await service.updateProjectMonthlySheet(manager, projectId, sheetId, {
      days: [],
    });

    assert.deepEqual(mocks.getDeleteManyArgs(), { where: { sheetId } });
    assert.deepEqual(updated.days, []);
  } finally {
    mocks.restore();
  }
});
