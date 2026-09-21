'use strict';

const assert = require('assert');
const { version: NEXUS_VERSION } = require('../../package.json');

const {
  renderTerminalWelcome,
  showTerminalWelcome,
} = require('../../scripts/lib/terminal-welcome');

const OFFICIAL_LINKS = Object.freeze({
  github: 'https://github.com/nexus-os/nexus-os',
  website: 'https://nexusos-dev.vercel.app',
  email: 'doodleino@gmail.com',
});

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed += 1;
  }
}

function createOutput(isTTY = true) {
  const writes = [];
  return {
    isTTY,
    writes,
    write(value) {
      writes.push(value);
    },
  };
}

console.log('\n=== Terminal welcome tests ===\n');

test('renders the cfonts block NEXUS wordmark with a welcome, version, and boxed links', () => {
  const welcome = renderTerminalWelcome({ color: false });
  const lines = welcome.split('\n');
  const boxTop = lines.findIndex(line => line.startsWith('  ╭'));
  const boxBottom = lines.findIndex(line => line.startsWith('  ╰'));

  assert.match(welcome, /███╗\s+██╗███████╗██╗\s+██╗██╗\s+██╗███████╗/);
  assert.strictEqual(welcome.includes('◕'), false);
  assert.strictEqual(welcome.includes('ᴗ'), false);
  assert.match(welcome, /Welcome to NEXUS-OS!/);
  assert.ok(welcome.includes(`v${NEXUS_VERSION}`));
  assert.ok(boxTop > 0);
  assert.ok(boxBottom > boxTop);
  assert.ok(lines.slice(boxTop + 1, boxBottom).every(line => /^ {2}│ .* │$/.test(line)));
  assert.strictEqual(lines[boxTop].length, lines[boxBottom].length);
  assert.ok(welcome.includes(`GitHub:  ${OFFICIAL_LINKS.github}`));
  assert.ok(welcome.includes(`Website: ${OFFICIAL_LINKS.website}`));
  assert.ok(welcome.includes(`Email:   ${OFFICIAL_LINKS.email}`));
  assert.strictEqual(welcome.includes('\x1b['), false);
});

test('renders an explicitly verified installed version when provided', () => {
  const welcome = renderTerminalWelcome({ color: false, version: '2.1.0' });

  assert.ok(welcome.includes('v2.1.0'));
  assert.strictEqual(welcome.includes(`v${NEXUS_VERSION}`), NEXUS_VERSION === '2.1.0');
});

test('rejects unsafe installed-version text before terminal rendering', () => {
  assert.throws(
    () => renderTerminalWelcome({ color: false, version: '2.1.0\u001b[31m' }),
    /Invalid NEXUS-OS version/
  );
});

test('colors the NEXUS wordmark from electric cyan to electric violet', () => {
  const welcome = renderTerminalWelcome({ color: true });
  const cyan = '\x1b[38;2;0;240;255m';
  const violet = '\x1b[38;2;138;43;226m';
  const dimVersion = `\x1b[2mv${NEXUS_VERSION}\x1b[0m`;

  assert.ok(welcome.includes(cyan));
  assert.ok(welcome.includes(violet));
  assert.ok(welcome.includes(dimVersion));
  assert.ok(welcome.indexOf(cyan) < welcome.indexOf(violet));
});

test('uses terminal color only when NO_COLOR is absent', () => {
  const coloredOutput = createOutput();
  const plainOutput = createOutput();

  showTerminalWelcome({
    action: 'installed',
    env: {},
    interactive: true,
    output: coloredOutput,
  });
  showTerminalWelcome({
    action: 'installed',
    env: { NO_COLOR: '' },
    interactive: true,
    output: plainOutput,
  });

  assert.strictEqual(coloredOutput.writes.join('').includes('\x1b['), true);
  assert.strictEqual(plainOutput.writes.join('').includes('\x1b['), false);
});

test('shows accurate copy after each verified interactive outcome', () => {
  const expectedMessages = {
    installed: 'Welcome to NEXUS-OS!',
    updated: 'NEXUS-OS is updated — thank you for using NEXUS-OS!',
    migrated: 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
    resumed: 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
    'already-migrated': 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
  };
  for (const [action, expectedMessage] of Object.entries(expectedMessages)) {
    const output = createOutput();
    const shown = showTerminalWelcome({
      action,
      env: { NO_COLOR: '1' },
      interactive: true,
      output,
    });

    assert.strictEqual(shown, true);
    assert.ok(output.writes.join('').includes(expectedMessage));
  }
});

test('stays quiet for cancellation, dry-runs, JSON, failures, and non-TTY output', () => {
  const cases = [
    { action: 'cancelled', interactive: true },
    { action: 'would-install', dryRun: true, interactive: true },
    { action: 'installed', interactive: true, json: true },
    { action: 'failed', interactive: true },
    { action: 'installed', interactive: false },
  ];

  for (const options of cases) {
    const output = createOutput(options.interactive !== false);
    const shown = showTerminalWelcome({
      env: {},
      output,
      ...options,
    });

    assert.strictEqual(shown, false);
    assert.deepStrictEqual(output.writes, []);
  }
});

test('stays quiet when the output stream itself is not a TTY', () => {
  const output = createOutput(false);
  const shown = showTerminalWelcome({
    action: 'installed',
    env: {},
    interactive: true,
    output,
  });

  assert.strictEqual(shown, false);
  assert.deepStrictEqual(output.writes, []);
});

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}\n`);
if (failed > 0) process.exit(1);
