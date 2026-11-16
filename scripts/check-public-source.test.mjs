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

test('detects common credential forms without returning values', () => {
  const samples = [
    ['ghp_' + 'a'.repeat(36), 'github-token'],
    ['AKIA' + 'A'.repeat(16), 'aws-access-key'],
    ['sk-' + 'a'.repeat(40), 'api-secret'],
    ['postgresql:' + '//fixture:password@localhost/db', 'database-credential-url'],
    ['eyJ' + 'a'.repeat(20) + '.eyJ' + 'b'.repeat(20) + '.' + 'c'.repeat(24), 'jwt-literal'],
  ];
  for (const [value, kind] of samples) assert.deepEqual(disclosureTypes(value), [kind]);
});

test('public error fallback never renders exception stacks', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync('client/src/components/ErrorBoundary.tsx', 'utf8');
  assert.ok(!source.includes('this.state.error?.stack'));
  assert.ok(!source.includes('error.stack'));
  assert.ok(source.includes('Reload Page'));
  assert.ok(source.includes('role="alert"'));
});

test('consultation draft invalidates on form edits without sending', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync('client/src/pages/ConsultationPreview.tsx', 'utf8');
  assert.ok(source.includes('onChange={invalidateDraft}'));
  assert.ok(source.includes('setDraft(null)'));
  assert.ok(source.includes('setCopyStatus("")'));
  assert.ok(source.includes('draft.mailto'));
});
