const test = require('node:test');
const assert = require('node:assert/strict');

const { buildShootManagementSummary, buildProjectSummaries, buildWorkspaceSummaries } = require('../src/modules/shoot-workspace/shoot-workspace.service');

test('buildShootManagementSummary aggregates reel/pic and approval metrics correctly', () => {
  const summary = buildShootManagementSummary([
    {
      id: 'workspace-1',
      name: 'Camp A',
      project: { id: 'project-1', projectName: 'Client A' },
      tasks: [
        {
          id: 'task-1',
          title: 'Shoot 1',
          noOfPics: 5,
          noOfReels: 3,
          extraContent: [
            { extraPics: 2, extraReels: 1, driveLink: 'https://drive.example/raw', submittedAt: '2026-09-01T00:00:00.000Z' },
            { extraPics: 3, extraReels: 2, driveLink: 'https://drive.example/raw2', submittedAt: '2026-09-02T00:00:00.000Z' },
          ],
          subtasks: [
            { type: 'REEL', status: 'APPROVED', submissionLinks: ['https://video/approved'] },
            { type: 'REEL', status: 'SUBMITTED', submissionLinks: ['https://video/pending'] },
            { type: 'PIC', status: 'APPROVED', submissionLinks: ['https://pic/approved'] },
            { type: 'PIC', status: 'REJECTED', submissionLinks: [] },
          ],
        },
      ],
    },
  ]);

  assert.equal(summary.totalReels, 3);
  assert.equal(summary.totalPics, 5);
  assert.equal(summary.extraReels, 3);
  assert.equal(summary.extraPics, 5);
  assert.equal(summary.reelsApprovedByManager, 1);
  assert.equal(summary.picsApprovedByManager, 1);
  assert.equal(summary.totalVideosAvailable, 4);
  assert.equal(summary.totalPicsAvailable, 6);
  assert.equal(summary.pendingForEdit, 10);
  assert.equal(summary.pendingForVideoEdit, 4);
  assert.equal(summary.pendingForPicEdit, 6);
  assert.equal(summary.pendingForUpload, 1);
  assert.equal(summary.videosUploaded, 0);
  assert.equal(summary.videosEdited, 0);
});

test('buildProjectSummaries keeps metrics separate for each project', () => {
  const projects = buildProjectSummaries([
    {
      id: 'workspace-test',
      name: 'Workspace test',
      project: { id: 'project-test', projectName: 'test' },
      tasks: [{ noOfReels: 10, noOfPics: 10, extraContent: [], subtasks: [] }],
    },
    {
      id: 'workspace-test1',
      name: 'Workspace test1',
      project: { id: 'project-test1', projectName: 'test1' },
      tasks: [{ noOfReels: 20, noOfPics: 20, extraContent: [], subtasks: [] }],
    },
  ]);

  assert.equal(projects.length, 2);
  assert.equal(projects.find((project) => project.name === 'test').totalReels, 10);
  assert.equal(projects.find((project) => project.name === 'test1').totalReels, 20);
});

test('buildWorkspaceSummaries groups all shoots under one workspace', () => {
  const workspaces = buildWorkspaceSummaries([
    {
      id: 'workspace-test',
      name: 'test',
      project: null,
      tasks: [
        { id: 'shoot-jest', title: 'jest', noOfReels: 10, noOfPics: 10, extraContent: [], subtasks: [] },
        { id: 'shoot-jask', title: 'jask', noOfReels: 20, noOfPics: 20, extraContent: [], subtasks: [] },
      ],
    },
  ]);

  assert.equal(workspaces.length, 1);
  assert.equal(workspaces[0].name, 'test');
  assert.equal(workspaces[0].shoots.length, 2);
  assert.equal(workspaces[0].totalReels, 30);
  assert.equal(workspaces[0].totalPics, 30);
  assert.equal(workspaces[0].pendingForEdit, 0);
  assert.equal(workspaces[0].shoots[0].pendingForEdit, 0);
});

test('buildShootManagementSummary includes verified editor video count for the workspace project', () => {
  const summary = buildShootManagementSummary([
    {
      id: 'workspace-test',
      project: { id: 'project-test', projectName: 'test' },
      editorVideosEdited: 1,
      tasks: [{ noOfReels: 10, noOfPics: 10, extraContent: [], subtasks: [] }],
    },
  ]);

  assert.equal(summary.videosEdited, 1);
});

test('uses workspace name as legacy editor project fallback when shoot projectId is missing', () => {
  const summary = buildShootManagementSummary([
    {
      id: 'workspace-testt',
      name: 'testt',
      project: null,
      editorVideosEdited: 1,
      tasks: [{ noOfReels: 20, noOfPics: 10, extraContent: [], subtasks: [] }],
    },
  ]);

  assert.equal(summary.videosEdited, 1);
});

test('counts verified editor pics and deducts them from pending pic edit', () => {
  const summary = buildShootManagementSummary([
    {
      id: 'workspace-pics',
      name: 'test-pics',
      project: null,
      editorPicsEdited: 1,
      tasks: [{ noOfReels: 0, noOfPics: 5, extraContent: [], subtasks: [] }],
    },
  ]);

  assert.equal(summary.picsEdited, 1);
  assert.equal(summary.pendingForPicEdit, 0);
});
