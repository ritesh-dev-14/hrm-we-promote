const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createMetaAdsTaskSchema,
} = require('../src/modules/meta-ads-task/meta-ads-task.validation');

test('meta ads create schema accepts projectName, BOTH objective and HARSH funding', () => {
  const payload = {
    projectName: 'Summer Campaign',
    monthlyBudget: 5000,
    objective: 'BOTH',
    area: 'Delhi',
    fundsAddedBy: 'HARSH',
    assignedToId: '123e4567-e89b-12d3-a456-426614174000',
  };

  const result = createMetaAdsTaskSchema.validate(payload);
  assert.equal(result.error, undefined);
});
