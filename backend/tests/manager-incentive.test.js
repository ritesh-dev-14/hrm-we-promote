const test = require("node:test");
const assert = require("node:assert/strict");

const prisma = require("../src/config/prisma");
const { getPeriodRange, getScoreReport } = require("../src/modules/manager-incentive/manager-incentive.service");
const seoReportService = require("../src/modules/seo-report/seo-report.service");
const marketingReportService = require("../src/modules/marketing-report/marketing-report.service");

const day = (date) => new Date(`${date}T12:00:00.000Z`);

test("incentive periods use Monday-to-Sunday weeks and calendar months", () => {
  const weekly = getPeriodRange("weekly", "2026-06-17");
  assert.equal(weekly.fromDate, "2026-06-15");
  assert.equal(weekly.toDate, "2026-06-21");

  const monthly = getPeriodRange("monthly", "2026-06-17");
  assert.equal(monthly.fromDate, "2026-06-01");
  assert.equal(monthly.toDate, "2026-06-30");
});

test("incentive scores count report and evidenced reason tasks, not unevidenced reasons", async () => {
  const originals = {
    assignments: prisma.projectAssignment.findMany,
    marketing: prisma.marketingReport.findMany,
    seo: prisma.seoReport.findMany,
    seoUnable: prisma.seoUnableSubmission.findMany,
    coordinatorAssignments: prisma.coordinatorAssignment.findMany,
  };
  const manager = { id: "manager-1", name: "Manager One", employeeId: "M001" };
  const secondManager = { id: "manager-2", name: "Manager Two", employeeId: "M002" };
  const activeProject = (id, name, department, assignedManager, campaigns = []) => ({
    manager: assignedManager,
    assignedAt: day("2026-01-01"),
    project: {
      id,
      projectName: name,
      status: "ONGOING",
      startDate: day("2026-01-01"),
      endDate: day("2026-12-31"),
      department: { name: department },
      campaigns,
    },
  });
  let marketingRows = [{
    id: "meta-report",
    projectId: "meta-project",
    campaignId: "campaign-1",
    managerId: manager.id,
    date: day("2026-06-17"),
    unableToSubmitReason: "Account access issue",
    unableToSubmitScreenshotUrl: "https://example.com/evidence.png",
  }];
  prisma.projectAssignment.findMany = async () => [
    activeProject("seo-project", "SEO Project", "SEO Department", manager),
    activeProject("meta-project", "Meta Project", "Performance Marketing Department", manager, [
      { id: "campaign-1", name: "Campaign One", createdAt: day("2026-01-02") },
    ]),
    activeProject("second-seo-project", "Second SEO Project", "SEO Department", secondManager),
  ];
  prisma.marketingReport.findMany = async () => marketingRows;
  prisma.seoReport.findMany = async () => [{
    id: "seo-report",
    projectId: "seo-project",
    managerId: manager.id,
    checkDate: day("2026-06-17"),
  }];
  prisma.seoUnableSubmission.findMany = async () => [];
  prisma.coordinatorAssignment.findMany = async () => [];

  try {
    const report = await getScoreReport({ role: "ADMIN" }, {
      period: "daily",
      date: "2026-06-17",
    });
    const firstManager = report.managers.find((row) => row.managerId === manager.id);
    const secondManagerRow = report.managers.find((row) => row.managerId === secondManager.id);
    assert.equal(firstManager.expectedCount, 2);
    assert.equal(firstManager.completedCount, 2);
    assert.equal(firstManager.score, 100);
    assert.equal(firstManager.tasks.find((task) => task.category === "META_ADS").completionType, "UNABLE_TO_SUBMIT");
    assert.equal(secondManagerRow.completedCount, 0);
    assert.equal(secondManagerRow.score, 0);

    marketingRows = [{ ...marketingRows[0], unableToSubmitScreenshotUrl: null }];
    const withoutEvidence = await getScoreReport({ role: "ADMIN" }, {
      period: "daily",
      date: "2026-06-17",
    });
    const managerWithoutEvidence = withoutEvidence.managers.find((row) => row.managerId === manager.id);
    assert.equal(managerWithoutEvidence.completedCount, 1);
    assert.equal(managerWithoutEvidence.score, 50);
  } finally {
    prisma.projectAssignment.findMany = originals.assignments;
    prisma.marketingReport.findMany = originals.marketing;
    prisma.seoReport.findMany = originals.seo;
    prisma.seoUnableSubmission.findMany = originals.seoUnable;
    prisma.coordinatorAssignment.findMany = originals.coordinatorAssignments;
  }
});

test("incentive scores include Coordinator tasks completed or submitted with a reason", async () => {
  const originals = {
    assignments: prisma.projectAssignment.findMany,
    marketing: prisma.marketingReport.findMany,
    seo: prisma.seoReport.findMany,
    seoUnable: prisma.seoUnableSubmission.findMany,
    coordinatorAssignments: prisma.coordinatorAssignment.findMany,
  };
  const manager = { id: "manager-1", name: "Manager One", employeeId: "M001" };
  prisma.projectAssignment.findMany = async () => [];
  prisma.marketingReport.findMany = async () => [];
  prisma.seoReport.findMany = async () => [];
  prisma.seoUnableSubmission.findMany = async () => [];
  prisma.coordinatorAssignment.findMany = async () => [
    {
      id: "completed-task",
      assignedTo: manager,
      assignedBy: "Coordinator One",
      completionDate: day("2026-06-17"),
      status: "COMPLETED",
      reason: null,
      task: { projectName: "Completed task" },
    },
    {
      id: "reason-task",
      assignedTo: manager,
      assignedBy: "Coordinator One",
      completionDate: day("2026-06-17"),
      status: "UNABLE_TO_SUBMIT",
      reason: "Waiting for client input",
      task: { projectName: "Blocked task" },
    },
    {
      id: "unreported-task",
      assignedTo: manager,
      assignedBy: "Coordinator One",
      completionDate: day("2026-06-17"),
      status: "ASSIGNED",
      reason: null,
      task: { projectName: "Unreported task" },
    },
  ];

  try {
    const report = await getScoreReport({ role: "ADMIN" }, {
      period: "daily",
      date: "2026-06-17",
    });
    const managerRow = report.managers[0];
    assert.equal(managerRow.expectedCount, 3);
    assert.equal(managerRow.completedCount, 2);
    assert.equal(managerRow.coordinatorExpectedCount, 3);
    assert.equal(managerRow.coordinatorCompletedCount, 2);
    assert.equal(managerRow.coordinatorScore, 67);
    assert.equal(managerRow.score, 67);
    assert.equal(managerRow.tasks.find((task) => task.itemName === "Blocked task").screenshotUrl, null);
    assert.equal(managerRow.tasks.find((task) => task.itemName === "Blocked task").completed, true);
  } finally {
    prisma.projectAssignment.findMany = originals.assignments;
    prisma.marketingReport.findMany = originals.marketing;
    prisma.seoReport.findMany = originals.seo;
    prisma.seoUnableSubmission.findMany = originals.seoUnable;
    prisma.coordinatorAssignment.findMany = originals.coordinatorAssignments;
  }
});

test("incentive scores are restricted to Admin, HR, and Coordinators", async () => {
  await assert.rejects(
    getScoreReport({ role: "EA" }, { period: "daily", date: "2026-06-17" }),
    (error) => error.statusCode === 403,
  );
});

test("SEO and Meta Ads unable-to-submit entries require screenshot evidence", async () => {
  const manager = { id: "manager-1", role: "MANAGER", roles: ["MANAGER"] };
  await assert.rejects(
    seoReportService.createUnableSubmission(
      manager,
      { projectId: "seo-project", reportDate: "2026-06-17", reason: "Access issue" },
      null,
    ),
    /screenshot are required/i,
  );
  await assert.rejects(
    marketingReportService.createMarketingReport(
      manager,
      {
        projectId: "meta-project",
        campaignId: "campaign-1",
        date: "2026-06-17",
        unableToSubmitReason: "Access issue",
      },
      null,
    ),
    /screenshot with the unable-to-submit reason/i,
  );
});
