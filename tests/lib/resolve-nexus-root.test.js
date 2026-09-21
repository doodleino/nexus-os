/**
 * Tests for scripts/lib/resolve-nexus-root.js
 *
 * Covers the NEXUS root resolution fallback chain:
 *   1. NEXUS_ROOT or CLAUDE_PLUGIN_ROOT env var
 *   2. Standard install (~/.claude/)
 *   3. Exact plugin roots under ~/.claude/plugins/
 *   4. Plugin cache auto-detection
 *   5. Fallback to ~/.claude/
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const CURRENT_PACKAGE_VERSION = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
).version;

const { resolveNexusRoot, INLINE_RESOLVE } = require('../../scripts/lib/resolve-nexus-root');

// Sentinel NEXUS skill that resolveNexusRoot() requires (alongside the script tree)
// before accepting a root for skill consumers.
const NEXUS_SKILL_SENTINEL = path.join('skills', 'continuous-learning-v2');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-root-test-'));
}

function setupStandardInstall(homeDir) {
  const claudeDir = path.join(homeDir, '.claude');
  const scriptDir = path.join(claudeDir, 'scripts', 'lib');
  fs.mkdirSync(scriptDir, { recursive: true });
  fs.writeFileSync(path.join(scriptDir, 'utils.js'), '// stub');
  fs.mkdirSync(path.join(claudeDir, NEXUS_SKILL_SENTINEL), { recursive: true });
  return claudeDir;
}

function setupPluginInstall(homeDir, segments) {
  const pluginDir = path.join(homeDir, '.claude', 'plugins', ...segments);
  const scriptDir = path.join(pluginDir, 'scripts', 'lib');
  fs.mkdirSync(scriptDir, { recursive: true });
  fs.writeFileSync(path.join(scriptDir, 'utils.js'), '// stub');
  fs.mkdirSync(path.join(pluginDir, NEXUS_SKILL_SENTINEL), { recursive: true });
  return pluginDir;
}

function setupPluginCache(homeDir, pluginSlug, orgName, version) {
  const cacheDir = path.join(
    homeDir,
    '.claude',
    'plugins',
    'cache',
    pluginSlug,
    orgName,
    version
  );
  const scriptDir = path.join(cacheDir, 'scripts', 'lib');
  fs.mkdirSync(scriptDir, { recursive: true });
  fs.writeFileSync(path.join(scriptDir, 'utils.js'), '// stub');
  fs.mkdirSync(path.join(cacheDir, NEXUS_SKILL_SENTINEL), { recursive: true });
  return cacheDir;
}

function runTests() {
  console.log('\n=== Testing resolve-nexus-root.js ===\n');

  let passed = 0;
  let failed = 0;

  // ─── Env Var Priority ───

  if (test('returns NEXUS_ROOT when set', () => {
    const oldVal = process.env.NEXUS_ROOT;
    try {
      process.env.NEXUS_ROOT = '/custom/nexus/root';
      const result = resolveNexusRoot();
      assert.strictEqual(result, '/custom/nexus/root');
    } finally {
      if (oldVal === undefined) delete process.env.NEXUS_ROOT;
      else process.env.NEXUS_ROOT = oldVal;
    }
  })) passed++; else failed++;

  if (test('returns CLAUDE_PLUGIN_ROOT when set', () => {
    const result = resolveNexusRoot({ envRoot: '/custom/plugin/root' });
    assert.strictEqual(result, '/custom/plugin/root');
  })) passed++; else failed++;

  if (test('trims whitespace from CLAUDE_PLUGIN_ROOT', () => {
    const result = resolveNexusRoot({ envRoot: '  /trimmed/root  ' });
    assert.strictEqual(result, '/trimmed/root');
  })) passed++; else failed++;

  if (test('skips empty CLAUDE_PLUGIN_ROOT', () => {
    const homeDir = createTempDir();
    try {
      setupStandardInstall(homeDir);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, path.join(homeDir, '.claude'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('skips whitespace-only CLAUDE_PLUGIN_ROOT', () => {
    const homeDir = createTempDir();
    try {
      setupStandardInstall(homeDir);
      const result = resolveNexusRoot({ envRoot: '   ', homeDir });
      assert.strictEqual(result, path.join(homeDir, '.claude'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ─── Standard Install ───

  if (test('finds standard install at ~/.claude/', () => {
    const homeDir = createTempDir();
    try {
      setupStandardInstall(homeDir);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, path.join(homeDir, '.claude'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('finds plugin install at ~/.claude/plugins/nexus-os', () => {
    const homeDir = createTempDir();
    try {
      const expected = setupPluginInstall(homeDir, ['nexus-os']);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('finds plugin install at ~/.claude/plugins/nexus-os@nexus-os', () => {
    const homeDir = createTempDir();
    try {
      const expected = setupPluginInstall(homeDir, ['nexus-os@nexus-os']);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('finds marketplace plugin install at ~/.claude/plugins/marketplaces/nexus-os', () => {
    const homeDir = createTempDir();
    try {
      const expected = setupPluginInstall(homeDir, ['marketplaces', 'nexus-os']);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('prefers exact plugin install over plugin cache', () => {
    const homeDir = createTempDir();
    try {
      const expected = setupPluginInstall(homeDir, ['marketplaces', 'nexus-os']);
      setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ─── Plugin Cache Auto-Detection ───

  if (test('discovers plugin root from cache directory', () => {
    const homeDir = createTempDir();
    try {
      const expected = setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('prefers standard install over plugin cache', () => {
    const homeDir = createTempDir();
    try {
      const claudeDir = setupStandardInstall(homeDir);
      setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, claudeDir,
        'Standard install should take precedence over plugin cache');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('handles multiple versions in plugin cache', () => {
    const homeDir = createTempDir();
    try {
      setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', '1.7.0');
      const expected = setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.ok(
        result === expected ||
        result === path.join(homeDir, '.claude', 'plugins', 'cache', 'nexus-os', 'nexus-os-team', '1.7.0'),
        'Should resolve to a valid plugin cache directory'
      );
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ─── Fallback ───

  if (test('falls back to ~/.claude/ when nothing is found', () => {
    const homeDir = createTempDir();
    try {
      fs.mkdirSync(path.join(homeDir, '.claude'), { recursive: true });
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, path.join(homeDir, '.claude'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('falls back gracefully when ~/.claude/ does not exist', () => {
    const homeDir = createTempDir();
    try {
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, path.join(homeDir, '.claude'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ─── Custom Probe ───

  if (test('supports custom probe path', () => {
    const homeDir = createTempDir();
    try {
      const claudeDir = path.join(homeDir, '.claude');
      fs.mkdirSync(path.join(claudeDir, 'custom'), { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'custom', 'marker.js'), '// probe');
      const result = resolveNexusRoot({
        envRoot: '',
        homeDir,
        probe: path.join('custom', 'marker.js'),
      });
      assert.strictEqual(result, claudeDir);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ─── Partial install ───

  if (test('rejects a partial ~/.claude (scripts + non-NEXUS skills) and prefers a complete root', () => {
    const homeDir = createTempDir();
    try {
      const claudeDir = path.join(homeDir, '.claude');
      const scriptDir = path.join(claudeDir, 'scripts', 'lib');
      fs.mkdirSync(scriptDir, { recursive: true });
      fs.writeFileSync(path.join(scriptDir, 'utils.js'), '// stub');
      fs.mkdirSync(path.join(claudeDir, 'skills', 'my-own-skill'), { recursive: true });
      const expected = setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected,
        'a scripts-only ~/.claude must not shadow a complete plugin-cache root');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('a scripts-only ~/.claude with no complete root falls back to ~/.claude', () => {
    const homeDir = createTempDir();
    try {
      const claudeDir = path.join(homeDir, '.claude');
      const scriptDir = path.join(claudeDir, 'scripts', 'lib');
      fs.mkdirSync(scriptDir, { recursive: true });
      fs.writeFileSync(path.join(scriptDir, 'utils.js'), '// stub');
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, claudeDir);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('rejects a partial exact plugin root (scripts, no NEXUS skill) and prefers a complete root', () => {
    const homeDir = createTempDir();
    try {
      const partialScripts = path.join(homeDir, '.claude', 'plugins', 'nexus-os', 'scripts', 'lib');
      fs.mkdirSync(partialScripts, { recursive: true });
      fs.writeFileSync(path.join(partialScripts, 'utils.js'), '// stub');
      const expected = setupPluginCache(homeDir, 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION);
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, expected,
        'a scripts-only exact plugin root must not shadow a complete plugin-cache root');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('rejects a partial plugin-cache root (scripts, no NEXUS skill) and falls back to ~/.claude', () => {
    const homeDir = createTempDir();
    try {
      const cacheScripts = path.join(
        homeDir, '.claude', 'plugins', 'cache', 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION,
        'scripts', 'lib'
      );
      fs.mkdirSync(cacheScripts, { recursive: true });
      fs.writeFileSync(path.join(cacheScripts, 'utils.js'), '// stub');
      const result = resolveNexusRoot({ envRoot: '', homeDir });
      assert.strictEqual(result, path.join(homeDir, '.claude'),
        'a scripts-only plugin-cache root must not be returned; fall back to ~/.claude');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('custom probe skips a qualifying root that lacks the probed script (auto-update)', () => {
    const homeDir = createTempDir();
    try {
      const claudeDir = setupStandardInstall(homeDir);
      const marketplaceRoot = setupPluginInstall(homeDir, ['marketplaces', 'nexus-os']);
      fs.writeFileSync(path.join(marketplaceRoot, 'scripts', 'auto-update.js'), '// stub');

      assert.strictEqual(
        resolveNexusRoot({ envRoot: '', homeDir }),
        claudeDir,
        'default probe accepts a root with full resolver evidence'
      );
      assert.strictEqual(
        resolveNexusRoot({
          envRoot: '',
          homeDir,
          probe: path.join('scripts', 'auto-update.js'),
        }),
        marketplaceRoot,
        'auto-update probe must skip roots that lack the script it will execute'
      );
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ─── INLINE_RESOLVE String Constant ───

  if (test('INLINE_RESOLVE is a non-empty string', () => {
    assert.strictEqual(typeof INLINE_RESOLVE, 'string');
    assert.ok(INLINE_RESOLVE.length > 50);
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE does not contain spread, nested arrays, or escaped quotes', () => {
    assert.ok(!INLINE_RESOLVE.includes('...'), 'No spread operators allowed');
    assert.ok(!INLINE_RESOLVE.includes('[[') && !INLINE_RESOLVE.includes(']]'), 'No nested arrays allowed');
    assert.ok(!INLINE_RESOLVE.includes('"'), 'No escaped double quotes allowed');
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE returns CLAUDE_PLUGIN_ROOT when set', () => {
    const { execFileSync } = require('child_process');
    const result = execFileSync('node', [
      '-e', `console.log(${INLINE_RESOLVE})`,
    ], {
      env: { PATH: process.env.PATH, CLAUDE_PLUGIN_ROOT: '/custom/from/env' },
      encoding: 'utf8',
    }).trim();
    assert.strictEqual(result, '/custom/from/env');
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE delegates to committed resolver when env var is unset', () => {
    const homeDir = createTempDir();
    try {
      const resolverDir = path.join(homeDir, '.claude', 'scripts', 'lib');
      fs.mkdirSync(resolverDir, { recursive: true });
      fs.writeFileSync(path.join(resolverDir, 'resolve-nexus-root.js'), `module.exports = { resolveNexusRoot() { return 'delegated:' + process.env.INLINE_RESOLVE_MARKER; } };`);
      const { execFileSync } = require('child_process');
      const result = execFileSync('node', [
        '-e', `console.log(${INLINE_RESOLVE})`,
      ], {
        env: {
          PATH: process.env.PATH,
          HOME: homeDir,
          USERPROFILE: homeDir,
          INLINE_RESOLVE_MARKER: 'ok',
        },
        encoding: 'utf8',
      }).trim();
      assert.strictEqual(result, 'delegated:ok');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE loads the committed resolver module from home base', () => {
    const homeDir = createTempDir();
    try {
      const resolverDir = path.join(homeDir, '.claude', 'scripts', 'lib');
      fs.mkdirSync(resolverDir, { recursive: true });
      fs.writeFileSync(path.join(resolverDir, 'resolve-nexus-root.js'), `const assert = require('assert');
module.exports = { resolveNexusRoot() { assert.strictEqual(process.env.HOME, ${JSON.stringify(homeDir)}); return 'module-loaded'; } };`);
      const { execFileSync } = require('child_process');
      const result = execFileSync('node', [
        '-e', `console.log(${INLINE_RESOLVE})`,
      ], {
        env: { PATH: process.env.PATH, HOME: homeDir, USERPROFILE: homeDir },
        encoding: 'utf8',
      }).trim();
      assert.strictEqual(result, 'module-loaded');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE bootstraps module from an exact plugin root when env unset', () => {
    const homeDir = createTempDir();
    try {
      const resolverDir = path.join(homeDir, '.claude', 'plugins', 'nexus-os', 'scripts', 'lib');
      fs.mkdirSync(resolverDir, { recursive: true });
      fs.writeFileSync(path.join(resolverDir, 'resolve-nexus-root.js'), `module.exports = { resolveNexusRoot() { return 'plugin-root'; } };`);
      const { execFileSync } = require('child_process');
      const result = execFileSync('node', [
        '-e', `console.log(${INLINE_RESOLVE})`,
      ], {
        env: { PATH: process.env.PATH, HOME: homeDir, USERPROFILE: homeDir },
        encoding: 'utf8',
      }).trim();
      assert.strictEqual(result, 'plugin-root');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE bootstraps module from the versioned plugin cache when env unset', () => {
    const homeDir = createTempDir();
    try {
      const resolverDir = path.join(
        homeDir, '.claude', 'plugins', 'cache', 'nexus-os', 'nexus-os-team', CURRENT_PACKAGE_VERSION,
        'scripts', 'lib'
      );
      fs.mkdirSync(resolverDir, { recursive: true });
      fs.writeFileSync(path.join(resolverDir, 'resolve-nexus-root.js'), `module.exports = { resolveNexusRoot() { return 'cache-root'; } };`);
      const { execFileSync } = require('child_process');
      const result = execFileSync('node', [
        '-e', `console.log(${INLINE_RESOLVE})`,
      ], {
        env: { PATH: process.env.PATH, HOME: homeDir, USERPROFILE: homeDir },
        encoding: 'utf8',
      }).trim();
      assert.strictEqual(result, 'cache-root');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('INLINE_RESOLVE falls back to ~/.claude/ when nothing found', () => {
    const homeDir = createTempDir();
    try {
      const { execFileSync } = require('child_process');
      const result = execFileSync('node', [
        '-e', `console.log(${INLINE_RESOLVE})`,
      ], {
        env: { PATH: process.env.PATH, HOME: homeDir, USERPROFILE: homeDir },
        encoding: 'utf8',
      }).trim();
      assert.strictEqual(result, path.join(homeDir, '.claude'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
