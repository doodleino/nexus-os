/**
 * Published npm binary aliases for the primary NEXUS-OS CLI.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { getNpmPackEntry } = require('../lib/npm-pack-output');

const repoRoot = path.join(__dirname, '..', '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
);
const packageLock = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'package-lock.json'), 'utf8')
);
const activePackageManager = process.env.CLAUDE_CODE_PACKAGE_MANAGER || 'npm';
const supportedPackageManagers = new Set(['npm', 'pnpm', 'yarn', 'bun']);
const windowsPackageCommands = new Set([
  'bun',
  'bunx',
  'npm',
  'npx',
  'pnpm',
  'yarn',
]);
const unsafeWindowsShellChars = /[\r\n"&|<>^%!()]/;
const commandTimeoutMs = 90_000;
const archiveExtractionTimeoutMs = 180_000;

let passed = 0;
let failed = 0;
let packedFixture;
let localPackedProject;

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

function quoteWindowsCommandToken(value) {
  const token = String(value);
  assert.doesNotMatch(
    token,
    unsafeWindowsShellChars,
    'Package command contains characters that are unsafe for cmd.exe'
  );
  if (token === '') return '""';
  return /\s/.test(token) ? `"${token}"` : token;
}

function getSpawnInvocation(command, args, platform = process.platform) {
  if (platform !== 'win32' || !windowsPackageCommands.has(command)) {
    return { args, command };
  }

  return {
    args: undefined,
    command: [`${command}.cmd`, ...args]
      .map(quoteWindowsCommandToken)
      .join(' '),
    shell: true,
  };
}

function withPathPrefix(environment, prefix) {
  const nextEnvironment = { ...environment };
  const pathKey = Object.keys(nextEnvironment)
    .find(key => key.toLowerCase() === 'path') || 'PATH';
  nextEnvironment[pathKey] = [prefix, nextEnvironment[pathKey]]
    .filter(Boolean)
    .join(path.delimiter);
  return nextEnvironment;
}

function run(command, args, options = {}) {
  const invocation = getSpawnInvocation(command, args);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    env: options.env || process.env,
    maxBuffer: 10 * 1024 * 1024,
    shell: invocation.shell || false,
    timeout: options.timeout ?? commandTimeoutMs,
    windowsHide: true,
  });

  assert.ifError(result.error);
  assert.strictEqual(
    result.status,
    0,
    [
      `${command} ${args.join(' ')} exited with ${result.status}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n')
  );
  return result;
}

function getPackedFixture() {
  if (packedFixture) {
    return packedFixture;
  }

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-bin-'));
  const packResult = run(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', directory]
  );
  const packOutput = JSON.parse(packResult.stdout);
  const packEntry = getNpmPackEntry(packOutput, packageJson.name);
  const filename = packEntry?.filename;
  assert.ok(filename, 'npm pack should report the archive filename');

  packedFixture = {
    archivePath: path.join(directory, filename),
    directory,
    publishedPaths: new Set(
      packEntry?.files?.map(file => file.path) || []
    ),
  };
  return packedFixture;
}

function prepareLocalPackedProject(_packageManager) {
  if (localPackedProject) {
    return localPackedProject;
  }

  const fixture = getPackedFixture();
  const projectDirectory = path.join(fixture.directory, 'local-project');
  const modulesDirectory = path.join(projectDirectory, 'node_modules');
  const extractedDirectory = path.join(modulesDirectory, 'package');
  const packageDirectory = path.join(modulesDirectory, 'nexus-os');
  const binDirectory = path.join(modulesDirectory, '.bin');

  fs.mkdirSync(projectDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(projectDirectory, 'package.json'),
    `${JSON.stringify({ name: 'nexus-packed-smoke', private: true }, null, 2)}\n`
  );
  fs.mkdirSync(modulesDirectory, { recursive: true });
  run('tar', ['-xzf', fixture.archivePath, '-C', modulesDirectory], {
    cwd: projectDirectory,
    timeout: archiveExtractionTimeoutMs,
  });
  if (fs.existsSync(extractedDirectory)) {
    fs.renameSync(extractedDirectory, packageDirectory);
  }
  fs.mkdirSync(binDirectory, { recursive: true });

  for (const executable of ['nexus', 'nexus-os']) {
    const scriptRelativePath = packageJson.bin[executable];
    if (!scriptRelativePath) continue;
    const scriptPath = path.join(packageDirectory, scriptRelativePath);
    if (fs.existsSync(scriptPath)) {
      fs.chmodSync(scriptPath, 0o755);
    }
    if (process.platform === 'win32') {
      const cmdPath = path.join(binDirectory, `${executable}.cmd`);
      const target = scriptRelativePath.replace(/\//g, '\\');
      fs.writeFileSync(
        cmdPath,
        `@ECHO off\r\nnode "%~dp0\\..\\nexus-os\\${target}" %*\r\n`
      );
    } else {
      fs.symlinkSync(
        path.join('..', 'nexus-os', scriptRelativePath),
        path.join(binDirectory, executable)
      );
    }
  }

  localPackedProject = { binDirectory, projectDirectory };
  return localPackedProject;
}

function launchPackedBinary(executable, args) {
  const project = prepareLocalPackedProject(activePackageManager);
  const localEnvironment = withPathPrefix(process.env, project.binDirectory);
  const scriptPath = path.join(repoRoot, packageJson.bin[executable] || 'scripts/nexus.js');
  return spawnSync('node', [scriptPath, ...args], {
    cwd: project.projectDirectory,
    encoding: 'utf8',
    env: localEnvironment,
    timeout: commandTimeoutMs,
  });
}

console.log(`\n=== NEXUS-OS packed binary tests (${activePackageManager}) ===\n`);

test('CI selects a supported package runner', () => {
  assert.ok(
    supportedPackageManagers.has(activePackageManager),
    `CLAUDE_CODE_PACKAGE_MANAGER must be one of ${[...supportedPackageManagers].join(', ')}`
  );
});

test('Windows package shims use one safely quoted command line', () => {
  assert.deepStrictEqual(
    getSpawnInvocation('npm', ['pack', '--pack-destination', 'C:\\Temp Dir'], 'win32'),
    {
      args: undefined,
      command: 'npm.cmd pack --pack-destination "C:\\Temp Dir"',
      shell: true,
    }
  );
  assert.deepStrictEqual(
    getSpawnInvocation('tar', ['-xzf', 'C:\\Temp Dir\\fixture.tgz'], 'win32'),
    {
      args: ['-xzf', 'C:\\Temp Dir\\fixture.tgz'],
      command: 'tar',
    }
  );
  assert.throws(
    () => getSpawnInvocation('npm', ['pack', 'C:\\Temp & unsafe'], 'win32'),
    /unsafe for cmd\.exe/
  );
});

test('published package exposes nexus and nexus-os through scripts/nexus.js', () => {
  assert.strictEqual(packageJson.bin.nexus, 'scripts/nexus.js');
  assert.strictEqual(packageJson.bin['nexus-os'], 'scripts/nexus.js');
  assert.strictEqual(packageLock.packages[''].bin.nexus, 'scripts/nexus.js');
  assert.strictEqual(packageLock.packages[''].bin['nexus-os'], 'scripts/nexus.js');

  const fixture = getPackedFixture();
  assert.ok(
    fixture.publishedPaths.has('scripts/nexus.js'),
    'npm package should publish the shared CLI target'
  );
});

test('packed nexus-os launches the guided setup help', () => {
  const result = launchPackedBinary('nexus-os', ['setup', '--help']);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /guided setup/i);
});

test('packed nexus-os launches the guided multi-harness help', () => {
  const result = launchPackedBinary('nexus-os', ['install', '--guided', '--help']);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /guided multi-harness install/i);
});

test('packed nexus alias launches the primary dispatcher', () => {
  const result = launchPackedBinary('nexus', ['--help']);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /NEXUS-OS selective-install CLI/);
  assert.match(result.stdout, /nexus install --guided/);
});

if (packedFixture) {
  try {
    fs.rmSync(packedFixture.directory, { force: true, recursive: true });
  } catch (_) {
    // Ignore cleanup error
  }
}

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
