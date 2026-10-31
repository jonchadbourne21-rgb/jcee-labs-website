import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Exercise provider -> wrapper -> pinned child, including the inherited PATH.
for (const failure of ['', 'pnpm', 'install', 'build']) test(`Manus build handoff: ${failure || 'Node 24 host to pinned child'}`, () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'manus-build-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.mkdirSync(path.join(root, 'bin'));
    fs.mkdirSync(path.join(root, 'pinned'));
    fs.copyFileSync('scripts/manus-build.sh', path.join(root, 'scripts/manus-build.sh'));
    const put = (name, text) => fs.writeFileSync(path.join(root, name), text, {mode:0o755});
    put('bin/corepack', '#!/bin/sh\n[ "$1" = pnpm@10.4.1 ] || exit 19\nshift\nexec pnpm "$@"\n');
    put('bin/node', '#!/bin/sh\necho v24.22.1\n');
    put('pinned/node', '#!/bin/sh\necho v22.23.4\n');
    put('scripts/manus-node.sh', '#!/bin/sh\nset -eu\n[ "$(node --version)" = v24.22.1 ]\nshift\nexport PATH="$PWD/pinned:$PATH"\nexec "$@"\n');
    put('bin/pnpm', `#!/bin/sh\nif [ "$1" = --version ]; then echo ${failure === 'pnpm' ? '11.0.0' : '10.4.1'}; exit; fi\necho "$*" >> "$PWD/calls"\n[ "$1" != "${failure}" ] || exit 17\n`);
    const result = spawnSync('sh', [path.join(root, 'scripts/manus-build.sh')], {env:{...process.env,PATH:`${root}/bin:${process.env.PATH}`},encoding:'utf8'});
    assert.equal(result.status, failure ? (failure === 'pnpm' ? 1 : 17) : 0, result.stderr);
    const calls = fs.existsSync(path.join(root, 'calls')) ? fs.readFileSync(path.join(root,'calls'),'utf8') : '';
    assert.equal(calls, failure === 'pnpm' ? '' : failure === 'install' ? 'install --frozen-lockfile\n' : 'install --frozen-lockfile\nbuild\n');
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
