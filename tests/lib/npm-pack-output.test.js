const assert = require('assert');
const { getNpmPackEntry } = require('./npm-pack-output');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
    failed += 1;
  }
}

test('reads the npm 11 array response', () => {
  const entry = getNpmPackEntry([
    { name: 'unrelated-package', filename: 'unrelated-package-1.0.0.tgz' },
    { name: 'nexus-os', filename: 'nexus-os-2.2.0.tgz' },
  ], 'nexus-os');

  assert.strictEqual(entry.filename, 'nexus-os-2.2.0.tgz');
});

test('reads the npm 12 package-keyed response', () => {
  const entry = getNpmPackEntry({
    'nexus-os': {
      name: 'nexus-os',
      filename: 'nexus-os-2.2.0.tgz',
    },
  }, 'nexus-os');

  assert.strictEqual(entry.filename, 'nexus-os-2.2.0.tgz');
});

test('finds a requested package in a generic object response', () => {
  const entry = getNpmPackEntry({
    unrelated: { name: 'unrelated-package', filename: 'unrelated-package-1.0.0.tgz' },
    target: { name: 'nexus-os', filename: 'nexus-os-2.2.0.tgz' },
  }, 'nexus-os');

  assert.strictEqual(entry.filename, 'nexus-os-2.2.0.tgz');
});

test('returns undefined for empty or malformed responses', () => {
  assert.strictEqual(getNpmPackEntry([], 'nexus-os'), undefined);
  assert.strictEqual(getNpmPackEntry({}, 'nexus-os'), undefined);
  assert.strictEqual(getNpmPackEntry(null, 'nexus-os'), undefined);
  assert.strictEqual(
    getNpmPackEntry([
      { name: 'unrelated-package', filename: 'unrelated-package-1.0.0.tgz' },
    ], 'nexus-os'),
    undefined
  );
  assert.strictEqual(
    getNpmPackEntry({
      unrelated: { name: 'unrelated-package', filename: 'unrelated-package-1.0.0.tgz' },
    }, 'nexus-os'),
    undefined
  );
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
