import test from 'node:test';
import assert from 'node:assert/strict';
import { disclosureTypes } from './check-public-source.mjs';

test('rejects a private Library locator even without a custody label', () => {
  assert.deepEqual(disclosureTypes('Library ' + 'libfile_' + 'a'.repeat(32)), ['private-library-locator']);
});
test('rejects private preview custody independently of Library', () => {
  assert.deepEqual(disclosureTypes('Preview ' + 'custody:' + ' Drive private-reference'), ['private-preview-custody']);
});
test('rejects private key material without reporting its value', () => {
  assert.deepEqual(disclosureTypes('-----BEGIN ' + 'OPENSSH PRIVATE KEY-----'), ['private-key']);
});
test('allows public publication links and ordinary provenance', () => {
  assert.deepEqual(disclosureTypes('https://drive.google.com/file/d/public-publication/view\nPreview custody is recorded privately.'), []);
});
