#!/bin/sh
set -eu
sh -n scripts/manus-node.sh
test "$(grep -c 'node-v\$version-\$platform.tar.gz' scripts/manus-node.sh)" -eq 1
grep -Fq 'sha256sum -c -' scripts/manus-node.sh
grep -Fq 'tar --no-same-owner -xzf' scripts/manus-node.sh
grep -Fq 'findmnt -n -o OPTIONS' scripts/manus-node.sh
grep -Fq 'Node execution failed' scripts/manus-node.sh
grep -Fq 'no mount-policy workaround attempted' scripts/manus-node.sh
node --version | grep -Fx 'v22.23.4'
sh scripts/manus-node.sh -- node --version | grep -Fx 'v22.23.4'
echo 'Runtime wrapper static/managed checks PASS; downloaded runtime is separately tested in CI.'
