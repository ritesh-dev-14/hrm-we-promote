const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizePhoneKey } = require('../src/modules/whatsapp-message/whatsapp-message.controller');

test('phone numbers with different spacing and punctuation share the same key', () => {
  assert.equal(normalizePhoneKey('88776 99887'), normalizePhoneKey('8877699887'));
  assert.equal(normalizePhoneKey('+91 88776-99887'), normalizePhoneKey('088776 99887'));
});
