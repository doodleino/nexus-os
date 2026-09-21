/**
 * Tests for sovereign compute neutrality in NEXUS-OS.
 */

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');
const { getComputeSponsorCopy } = require('../../scripts/lib/compute-sponsor');

const REPO_ROOT = path.join(__dirname, '..', '..');

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
    return false;
  }
}

function main() {
  console.log('\n=== Testing Sovereign Compute & Zero-Ad Surface ===\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    ['compute copy declares sovereign local-first compute', () => {
      const copy = getComputeSponsorCopy();
      assert.match(copy, /sovereign local-first compute/i);
      assert.match(copy, /zero external tracking/i);
    }],
    ['top-level CLI help displays sovereign compute copy', () => {
      const result = spawnSync('node', ['scripts/nexus.js', '--help'], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /sovereign local-first compute/i);
    }],
    ['installer help displays sovereign compute copy', () => {
      const result = spawnSync('node', ['scripts/install-apply.js', '--help'], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /sovereign local-first compute/i);
    }],
  ];

  for (const [name, fn] of tests) {
    if (runTest(name, fn)) {
      passed += 1;
    } else {
      failed += 1;
    }
  }

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
