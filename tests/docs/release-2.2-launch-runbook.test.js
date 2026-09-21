'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const runbook = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'docs', 'releases', '2.2.0', 'launch-runbook.md'),
  'utf8'
);

assert.match(runbook, /NEXUS-OS Lead.*only release operator/i);
assert.match(runbook, /npm view nexus-os dist-tags --json/);
assert.match(runbook, /nexus-os@2\.1\.0/);
assert.match(runbook, /git tag -s v2\.2\.0/);
assert.match(runbook, /git push origin refs\/tags\/v2\.2\.0/);
assert.match(runbook, /npm dist-tag add nexus-os@2\.1\.0 latest/);
assert.match(runbook, /staged.*registry.*latest/is);
assert.match(runbook, /do not unpublish/i);
assert.match(runbook, /rollback/i);

console.log('NEXUS-OS 2.2 launch runbook: ok');
