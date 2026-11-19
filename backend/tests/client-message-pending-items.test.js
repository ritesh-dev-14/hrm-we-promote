const test = require('node:test');
const assert = require('node:assert/strict');

const {
  groupPendingItemsByDepartment,
} = require('../src/modules/whatsapp-message/whatsapp-message.controller');

test('groups pending client items under their project department', () => {
  const projects = [
    { id: 'seo-project' },
    { id: 'marketing-project' },
    { id: 'social-project' },
  ];
  const pendingItemsByProject = new Map([
    ['seo-project', [{ note: 'SEO approval' }]],
    ['marketing-project', [{ note: 'Ad creative approval' }]],
    ['social-project', [{ note: 'Post approval' }]],
  ]);
  const departmentByProject = new Map([
    ['seo-project', 'seo'],
    ['marketing-project', 'marketing'],
    ['social-project', 'socialMedia'],
  ]);

  assert.deepEqual(
    groupPendingItemsByDepartment(projects, pendingItemsByProject, departmentByProject),
    {
      seo: [{ note: 'SEO approval' }],
      marketing: [{ note: 'Ad creative approval' }],
      socialMedia: [{ note: 'Post approval' }],
    },
  );
});
