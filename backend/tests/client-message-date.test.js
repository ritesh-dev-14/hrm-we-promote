const test = require('node:test');
const assert = require('node:assert/strict');

const { formatDateKeyInIST } = require('../src/modules/whatsapp-message/whatsapp-message.controller');

test('formats the previous day as the Meta Ads report date in IST', () => {
  assert.equal(formatDateKeyInIST('2026-11-18'), '18 November 2026');
});
