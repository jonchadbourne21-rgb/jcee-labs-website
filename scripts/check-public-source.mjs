import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Targeted disclosure guard, not a complete credential or history scanner.
export function disclosureTypes(text) {
  const found = [];
  if (/\blibfile_[a-f0-9]{24,}\b/i.test(text)) found.push('private-library-locator');
  if (/Preview custody:[^\n]*\bDrive\b/i.test(text)) found.push('private-preview-custody');
  if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(text)) found.push('private-key');
  return found;
}

export function checkPublicSource(root) {
  const paths = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0').filter(Boolean);
  const findings = [];
  for (const name of paths) {
    const bytes = readFileSync(path.join(root, name));
    if (bytes.includes(0)) continue;
    for (const type of disclosureTypes(bytes.toString('utf8'))) findings.push({ path: name, type });
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const findings = checkPublicSource(root);
  // Never echo matched content: future matches may contain actual secrets.
  console.log(JSON.stringify({ check: 'public-source-disclosure', findings }, null, 2));
  process.exitCode = findings.length ? 1 : 0;
}
