const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getChecklistItems,
  shouldEnableProjectOnboarding,
} = require("../src/modules/project-onboarding/project-onboarding.checklist");
const projectOnboardingService = require("../src/modules/project-onboarding/project-onboarding.service");

test("all supported departments receive the shared four-day onboarding items", () => {
  for (const department of ["SEO Department", "Meta Ads Department", "Social Media Department"]) {
    const items = getChecklistItems(department);
    assert.deepEqual(
      items.filter((item) => item.dueDays === 4).map((item) => item.key),
      ["project-entry", "project-info", "whatsapp-group", "credentials"],
    );
  }
});

test("department-specific tasks have a seven-day deadline", () => {
  assert.deepEqual(
    getChecklistItems("Social Media").filter((item) => item.dueDays === 7).map((item) => item.key),
    ["content-calendar", "shoot-planned"],
  );
  assert.deepEqual(
    getChecklistItems("Marketing").filter((item) => item.dueDays === 7).map((item) => item.key),
    ["funds-added", "campaign-running"],
  );
  assert.deepEqual(
    getChecklistItems("SEO").filter((item) => item.dueDays === 7).map((item) => item.key),
    ["keywords-planned", "keywords-shared", "seo-started"],
  );
});

test("projects outside onboarding departments do not receive checklist items", () => {
  assert.deepEqual(getChecklistItems("Web Development"), []);
});

test("only new projects in the supported departments are onboarding eligible", () => {
  for (const department of ["SEO", "Meta Ads", "Social Media"]) {
    assert.equal(shouldEnableProjectOnboarding(department), true);
  }
  assert.equal(shouldEnableProjectOnboarding("Web Development"), false);
});

test("roles outside Admin, HR, and Coordinator cannot access onboarding", async () => {
  for (const role of ["MANAGER", "EA", "EMPLOYEE", "QA"]) {
    await assert.rejects(
      projectOnboardingService.getProjectOnboarding({ role }),
      (error) => error.statusCode === 403,
    );
  }
});
