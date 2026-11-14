import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

export const aliases = {
  '01-signature-hero-exposed_8b945d8c.webp': '01-signature-hero-exposed.webp',
  '01-signature-hero-exposed-mobile_1b03fe3f.webp': '01-signature-hero-exposed-mobile.webp',
  '02-vow-receipt_372bf105.webp': '02-vow-receipt.webp',
  '02-vow-receipt_742d4ab7.webp': '02-vow-receipt.webp',
  '03-qcs-causal-rail_731e5c1a.webp': '03-qcs-causal-rail.webp',
  '01-hero-boundary_f53560ae.webp': '01-signature-hero-exposed.webp',
  'jcee-hero-cubes_002df7db.png': 'worldlab-company-v1.webp',
};

// Read-only probes. Never follow redirects or print bearer URLs / response bodies.
export async function verifyHostBoundary(base) {
  const root = new URL(base);
  if (!['http:', 'https:'].includes(root.protocol) || root.username || root.password ||
      root.pathname !== '/' || root.search || root.hash) throw new Error('Expected a bare HTTP(S) origin');
  const nonce = randomUUID();
  const cases = [];
  for (const method of ['GET', 'HEAD']) {
    for (const [key, image] of Object.entries(aliases))
      cases.push({ method, path: `/manus-storage/${key}`, status: 302, location: `/visuals/${image}` });
    for (const key of [`jcee-boundary-nonexistent-${nonce}`, `jcee-boundary-${nonce}/missing.json`, 'constructor', '__proto__', `%2e%2e%2fjcee-boundary-${nonce}`])
      cases.push({ method, path: `/manus-storage/${key}`, status: 404, location: null });
  }
  cases.push({ method: 'GET', path: '/api/trpc/auth.me', status: 404, location: null });
  const results = [];
  for (const check of cases) {
    try {
      const response = await fetch(new URL(check.path, root), {
        method: check.method, redirect: 'manual', cache: 'no-store',
        signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'JCEE-boundary-verification' },
      });
      const location = response.headers.get('location');
      const pass = response.status === check.status && location === check.location;
      results.push({ method: check.method, path: check.path, status: response.status,
        locationMatches: location === check.location, redirectPresent: location !== null, pass });
      await response.body?.cancel();
    } catch {
      results.push({ method: check.method, path: check.path, pass: false, error: 'Request failed or timed out' });
      break; // A network failure is inconclusive; do not repeatedly probe an unreachable host.
    }
  }
  return { origin: root.origin, checkedAt: new Date().toISOString(), pass: results.every(r => r.pass), results };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await verifyHostBoundary(process.argv[2]);
    console.log(JSON.stringify(result, null, 2));
    if (!result.pass) process.exitCode = 1;
  } catch { console.error('Boundary verification failed: supply a bare HTTP(S) origin.'); process.exitCode = 1; }
}
