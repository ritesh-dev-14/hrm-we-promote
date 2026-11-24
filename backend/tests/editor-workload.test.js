const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../src/config/prisma');
const { getEditorWorkload } = require('../src/modules/editor-workload/editor-workload.controller');

test('completed assignments without completion timestamps do not break workload loading', async () => {
  const originalUserFindMany = prisma.user.findMany;
  const originalAssignmentFindMany = prisma.taskItemAssignment.findMany;
  let response;

  prisma.user.findMany = async () => [{
    id: 'editor-1',
    name: 'Editor',
    employeeId: 'EMP-1',
    dailyVideoTarget: 1,
    dailyPostTarget: 0,
  }];
  prisma.taskItemAssignment.findMany = async () => [{
    id: 'assignment-1',
    status: 'VERIFIED',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    taskItem: { mediaType: 'VIDEO' },
  }];

  try {
    await getEditorWorkload({}, { json: (body) => { response = body; } }, (error) => {
      throw error;
    });
  } finally {
    prisma.user.findMany = originalUserFindMany;
    prisma.taskItemAssignment.findMany = originalAssignmentFindMany;
  }

  assert.equal(response.success, true);
  assert.equal(response.data[0].completedTasks.length, 1);
  assert.equal(response.data[0].stats.allTime.videosEdited, 1);
  assert.equal(response.data[0].stats.daily.videosEdited, 0);
});
