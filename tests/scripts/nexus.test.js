/**
 * Tests for scripts/nexus.js
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { createInstallState, writeInstallState } = require('../../scripts/lib/install-state');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'nexus.js');

function runCli(args, options = {}) {
  const envOverrides = {
    ...(options.env || {}),
  };
  const inheritedEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key !== 'NEXUS_DRY_RUN')
  );
  const homeAlias = typeof envOverrides.HOME === 'string' && !('USERPROFILE' in envOverrides)
    ? { USERPROFILE: envOverrides.HOME }
    : typeof envOverrides.USERPROFILE === 'string' && !('HOME' in envOverrides)
      ? { HOME: envOverrides.USERPROFILE }
      : {};
  const env = { ...inheritedEnv, ...envOverrides, ...homeAlias };

  return spawnSync('node', [SCRIPT, ...args], {
    encoding: 'utf8',
    cwd: options.cwd || process.cwd(),
    maxBuffer: 10 * 1024 * 1024,
    env,
  });
}

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function parseJson(stdout) {
  return JSON.parse(stdout.trim());
}

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
  console.log('\n=== Testing nexus.js ===\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    ['shows top-level help', () => {
      const result = runCli(['--help']);
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /NEXUS-OS selective-install CLI/);
      assert.match(result.stdout, /catalog/);
      assert.match(result.stdout, /list-installed/);
      assert.match(result.stdout, /doctor/);
      assert.match(result.stdout, /auto-update/);
      assert.match(result.stdout, /consult/);
      assert.match(result.stdout, /control-pane/);
      assert.match(result.stdout, /loop-status/);
      assert.match(result.stdout, /work-items/);
      assert.match(result.stdout, /platform-audit/);
      assert.match(result.stdout, /security-ioc-scan/);
      assert.match(result.stdout, /feedback/);
    }],
    ['delegates explicit install command', () => {
      const homeDir = createTempDir('nexus-cli-install-home-');
      try {
        const result = runCli(['install', '--dry-run', '--json', 'typescript'], {
          env: {
            CLAUDE_CONFIG_DIR: path.join(homeDir, '.claude'),
            HOME: homeDir,
          },
        });
        assert.strictEqual(result.status, 0, result.stderr);
        const payload = parseJson(result.stdout);
        assert.strictEqual(payload.dryRun, true);
        assert.strictEqual(payload.plan.mode, 'legacy-compat');
        assert.deepStrictEqual(payload.plan.legacyLanguages, ['typescript']);
        assert.ok(payload.plan.selectedModuleIds.includes('framework-language'));
      } finally {
        fs.rmSync(homeDir, { force: true, recursive: true });
      }
    }],
    ['routes implicit top-level args to install', () => {
      const homeDir = createTempDir('nexus-cli-install-home-');
      try {
        const result = runCli(['--dry-run', '--json', 'typescript'], {
          env: {
            CLAUDE_CONFIG_DIR: path.join(homeDir, '.claude'),
            HOME: homeDir,
          },
        });
        assert.strictEqual(result.status, 0, result.stderr);
        const payload = parseJson(result.stdout);
        assert.strictEqual(payload.dryRun, true);
        assert.strictEqual(payload.plan.mode, 'legacy-compat');
        assert.deepStrictEqual(payload.plan.legacyLanguages, ['typescript']);
        assert.ok(payload.plan.selectedModuleIds.includes('framework-language'));
      } finally {
        fs.rmSync(homeDir, { force: true, recursive: true });
      }
    }],
    ['delegates plan command', () => {
      const result = runCli(['plan', '--list-profiles', '--json']);
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.ok(Array.isArray(payload.profiles));
      assert.ok(payload.profiles.length > 0);
    }],
    ['delegates catalog command', () => {
      const result = runCli(['catalog', 'show', 'framework:nextjs', '--json']);
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.id, 'framework:nextjs');
      assert.deepStrictEqual(payload.moduleIds, ['framework-language']);
    }],
    ['delegates consult command', () => {
      const result = runCli(['consult', 'security', 'reviews', '--json']);
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.matches[0].componentId, 'capability:security');
    }],
    ['supports help for the control-pane subcommand', () => {
      const result = runCli(['help', 'control-pane']);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /Usage:/);
      assert.match(result.stdout, /control-pane/);
    }],
    ['delegates lifecycle commands', () => {
      const homeDir = createTempDir('nexus-cli-home-');
      const projectRoot = createTempDir('nexus-cli-project-');
      const result = runCli(['list-installed', '--json'], {
        cwd: projectRoot,
        env: { HOME: homeDir },
      });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.deepStrictEqual(payload.records, []);
    }],
    ['keeps uninstall read-only when global --dry-run precedes the command', () => {
      const homeDir = createTempDir('nexus-cli-uninstall-home-');
      const projectRoot = createTempDir('nexus-cli-uninstall-project-');

      try {
        const targetRoot = path.join(projectRoot, '.cursor');
        const statePath = path.join(targetRoot, 'nexus-install-state.json');
        const managedPath = path.join(targetRoot, 'managed-rule.md');
        const managedContent = 'managed\n';
        fs.mkdirSync(targetRoot, { recursive: true });
        fs.writeFileSync(managedPath, managedContent);
        writeInstallState(statePath, createInstallState({
          adapter: { id: 'cursor-project', target: 'cursor', kind: 'project' },
          targetRoot,
          installStatePath: statePath,
          request: {
            profile: null,
            modules: [],
            includeComponents: [],
            excludeComponents: [],
            legacyLanguages: ['typescript'],
            legacyMode: true,
          },
          resolution: {
            selectedModules: ['legacy-cursor-install'],
            skippedModules: [],
          },
          source: {
            repoVersion: null,
            repoCommit: null,
            manifestVersion: 1,
          },
          operations: [{
            kind: 'copy-file',
            moduleId: 'rules-core',
            sourceRelativePath: 'rules/common/coding-style.md',
            destinationPath: managedPath,
            strategy: 'preserve-relative-path',
            ownership: 'managed',
            scaffoldOnly: false,
            contentSha256: crypto.createHash('sha256').update(managedContent).digest('hex'),
          }],
        }));

        const jsonResult = runCli(['--dry-run', 'uninstall', '--target', 'cursor', '--json'], {
          cwd: projectRoot,
          env: { HOME: homeDir },
        });
        assert.strictEqual(jsonResult.status, 0, jsonResult.stderr);
        const jsonPayload = parseJson(jsonResult.stdout);
        assert.strictEqual(jsonPayload.dryRun, true);
        assert.strictEqual(fs.existsSync(managedPath), true);
        assert.strictEqual(fs.existsSync(statePath), true);
      } finally {
        fs.rmSync(homeDir, { force: true, recursive: true });
        fs.rmSync(projectRoot, { force: true, recursive: true });
      }
    }],
    ['fails on unknown commands instead of treating them as installs', () => {
      const result = runCli(['bogus']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Unknown command: bogus/);
    }],
    ['fails on unknown help subcommands', () => {
      const result = runCli(['help', 'bogus']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Unknown command: bogus/);
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
