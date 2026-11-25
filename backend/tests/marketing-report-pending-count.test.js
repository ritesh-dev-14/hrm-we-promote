const test = require("node:test");
const assert = require("node:assert/strict");

const prisma = require("../src/config/prisma");
const service = require("../src/modules/marketing-report/marketing-report.service");

test("pending marketing report count is limited to the requested IST date", async () => {
  const originalCount = prisma.marketingReport.count;
  let query;
  prisma.marketingReport.count = async (args) => {
    query = args;
    return 2;
  };

  try {
    const count = await service.getPendingMarketingReportCount(
      { role: "ADMIN" },
      { date: "2026-11-25" },
    );

    assert.equal(count, 2);
    assert.equal(query.where.approvalStatus, "PENDING");
    assert.deepEqual(query.where.date, {
      gte: new Date("2026-11-24T18:30:00.000Z"),
      lt: new Date("2026-11-25T18:30:00.000Z"),
    });
  } finally {
    prisma.marketingReport.count = originalCount;
  }
});

test("pending marketing report count rejects invalid dates", async () => {
  await assert.rejects(
    service.getPendingMarketingReportCount(
      { role: "ADMIN" },
      { date: "2026-02-31" },
    ),
    /A valid report date is required/,
  );
});
