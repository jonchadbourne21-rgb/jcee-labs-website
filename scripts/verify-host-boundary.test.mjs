import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import { aliases, verifyHostBoundary } from './verify-host-boundary.mjs';

async function fixture(t, broken = false) {
  let followed = 0;
  const server = http.createServer((req, res) => {
    const key = req.url.slice('/manus-storage/'.length);
    if (req.url.startsWith('/signed-target')) { followed++; res.end('must not fetch'); return; }
    if (broken) { res.writeHead(307, { Location: '/signed-target?Signature=secret-fixture' }); res.end(); return; }
    if (req.url.startsWith('/manus-storage/') && Object.hasOwn(aliases, key)) {
      res.writeHead(302, { Location: `/visuals/${aliases[key]}` });
    } else res.writeHead(404);
    res.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return { base: `http://127.0.0.1:${server.address().port}`, followed: () => followed };
}
test('accepts exact public aliases, denied storage and disabled API', async t => {
  const f = await fixture(t);
  const result = await verifyHostBoundary(f.base);
  assert.equal(result.pass, true); assert.equal(result.results.length, 25);
  for (const image of Object.values(aliases)) assert.ok(fs.existsSync(`client/public/visuals/${image}`));
});
test('rejects signing redirects without following or recording credentials', async t => {
  const f = await fixture(t, true);
  const result = await verifyHostBoundary(f.base);
  assert.equal(result.pass, false); assert.equal(f.followed(), 0);
  assert.ok(result.results.every(r => !r.pass));
  assert.ok(!JSON.stringify(result).includes('secret-fixture'));
});
test('rejects non-origin URLs before network access', async () => {
  for (const base of ['file:///etc/passwd', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com/?token=x'])
    await assert.rejects(verifyHostBoundary(base));
});

test('public website assets do not depend on the reserved storage prefix', () => {
  for (const file of [
    'client/index.html',
    'client/src/company-cubes.css',
    'client/src/index.css',
    'client/src/precision-system.css',
    'client/src/hybrid-system.css',
  ]) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\/manus-storage\//, file);
    for (const match of source.matchAll(/(?:https:\/\/jceelabs\.com)?\/visuals\/([^"')\s]+)/g))
      assert.ok(fs.existsSync(`client/public/visuals/${match[1]}`), `${file}: ${match[1]}`);
  }
});
