/**
 * Universal Agent OS - Package Manager Detection & Command Resolution
 *
 * Provides auto-detection, configuration persistence, and secure command
 * synthesis across npm, pnpm, yarn, and bun package ecosystems.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { commandExists, getClaudeDir, readFile, writeFile } = require('./utils');

// Supported package managers configuration table
const PACKAGE_MANAGERS = {
  npm: {
    name: 'npm',
    lockFile: 'package-lock.json',
    installCmd: 'npm install',
    runCmd: 'npm run',
    execCmd: 'npx',
    testCmd: 'npm test',
    buildCmd: 'npm run build',
    devCmd: 'npm run dev'
  },
  pnpm: {
    name: 'pnpm',
    lockFile: 'pnpm-lock.yaml',
    installCmd: 'pnpm install',
    runCmd: 'pnpm',
    execCmd: 'pnpm dlx',
    testCmd: 'pnpm test',
    buildCmd: 'pnpm build',
    devCmd: 'pnpm dev'
  },
  yarn: {
    name: 'yarn',
    lockFile: 'yarn.lock',
    installCmd: 'yarn',
    runCmd: 'yarn',
    execCmd: 'yarn dlx',
    testCmd: 'yarn test',
    buildCmd: 'yarn build',
    devCmd: 'yarn dev'
  },
  bun: {
    name: 'bun',
    lockFile: 'bun.lock',
    lockFileAliases: ['bun.lockb'],
    installCmd: 'bun install',
    runCmd: 'bun run',
    execCmd: 'bunx',
    testCmd: 'bun test',
    buildCmd: 'bun run build',
    devCmd: 'bun run dev'
  }
};

// Heuristic priority for lockfile detection
const DETECTION_PRIORITY = ['pnpm', 'bun', 'yarn', 'npm'];

/**
 * Global configuration file path
 * @returns {string}
 */
function getConfigPath() {
  return path.join(getClaudeDir(), 'package-manager.json');
}

/**
 * Load global user configuration
 * @returns {object|null}
 */
function loadConfig() {
  const filePath = getConfigPath();
  const rawData = readFile(filePath);
  if (rawData) {
    try {
      return JSON.parse(rawData);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Persist global user configuration
 * @param {object} cfg
 */
function saveConfig(cfg) {
  const targetFile = getConfigPath();
  writeFile(targetFile, JSON.stringify(cfg, null, 2));
}

/**
 * Inspect project directory for presence of known lockfiles
 * @param {string} [projectDir=process.cwd()]
 * @returns {string|null}
 */
function detectFromLockFile(projectDir = process.cwd()) {
  for (const pm of DETECTION_PRIORITY) {
    const meta = PACKAGE_MANAGERS[pm];
    const candidateNames = [meta.lockFile, ...(meta.lockFileAliases || [])];

    if (candidateNames.some(name => fs.existsSync(path.join(projectDir, name)))) {
      return pm;
    }
  }
  return null;
}

/**
 * Inspect package.json for explicit packageManager declaration
 * @param {string} [projectDir=process.cwd()]
 * @returns {string|null}
 */
function detectFromPackageJson(projectDir = process.cwd()) {
  const manifestPath = path.join(projectDir, 'package.json');
  const fileContent = readFile(manifestPath);

  if (fileContent) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.packageManager && typeof parsed.packageManager === 'string') {
        const declared = parsed.packageManager.split('@')[0];
        if (PACKAGE_MANAGERS[declared]) {
          return declared;
        }
      }
    } catch {
      // Ignore unparseable package.json
    }
  }
  return null;
}

/**
 * Inspect host system for available package manager binaries
 * @returns {string[]}
 */
function getAvailablePackageManagers() {
  const availableList = [];
  for (const key of Object.keys(PACKAGE_MANAGERS)) {
    if (commandExists(key)) {
      availableList.push(key);
    }
  }
  return availableList;
}

/**
 * Resolve effective package manager using tiered detection priority
 * @param {object} [options={}]
 * @returns {{name: string, config: object, source: string}}
 */
function getPackageManager(options = {}) {
  const { projectDir = process.cwd() } = options;

  // Tier 1: Environment variable
  const envChoice = process.env.CLAUDE_PACKAGE_MANAGER;
  if (envChoice && PACKAGE_MANAGERS[envChoice]) {
    return {
      name: envChoice,
      config: PACKAGE_MANAGERS[envChoice],
      source: 'environment'
    };
  }

  // Tier 2: Project-specific local configuration (.claude/package-manager.json)
  const localConfigPath = path.join(projectDir, '.claude', 'package-manager.json');
  const localConfigRaw = readFile(localConfigPath);
  if (localConfigRaw) {
    try {
      const parsedLocal = JSON.parse(localConfigRaw);
      if (parsedLocal.packageManager && PACKAGE_MANAGERS[parsedLocal.packageManager]) {
        return {
          name: parsedLocal.packageManager,
          config: PACKAGE_MANAGERS[parsedLocal.packageManager],
          source: 'project-config'
        };
      }
    } catch {
      // Ignore invalid local configuration
    }
  }

  // Tier 3: package.json specification
  const packageJsonChoice = detectFromPackageJson(projectDir);
  if (packageJsonChoice) {
    return {
      name: packageJsonChoice,
      config: PACKAGE_MANAGERS[packageJsonChoice],
      source: 'package.json'
    };
  }

  // Tier 4: Lockfile heuristic
  const lockChoice = detectFromLockFile(projectDir);
  if (lockChoice) {
    return {
      name: lockChoice,
      config: PACKAGE_MANAGERS[lockChoice],
      source: 'lock-file'
    };
  }

  // Tier 5: Global configuration
  const globalConfig = loadConfig();
  if (globalConfig && globalConfig.packageManager && PACKAGE_MANAGERS[globalConfig.packageManager]) {
    return {
      name: globalConfig.packageManager,
      config: PACKAGE_MANAGERS[globalConfig.packageManager],
      source: 'global-config'
    };
  }

  // Tier 6: Safe default (npm)
  return {
    name: 'npm',
    config: PACKAGE_MANAGERS.npm,
    source: 'default'
  };
}

/**
 * Configure global user package manager preference
 * @param {string} pmName
 * @returns {object}
 */
function setPreferredPackageManager(pmName) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`Unknown package manager: ${pmName}`);
  }

  const userConfig = loadConfig() || {};
  userConfig.packageManager = pmName;
  userConfig.setAt = new Date().toISOString();

  try {
    saveConfig(userConfig);
  } catch (err) {
    throw new Error(`Failed to save package manager preference: ${err.message}`);
  }

  return userConfig;
}

/**
 * Configure project-specific package manager preference
 * @param {string} pmName
 * @param {string} [projectDir=process.cwd()]
 * @returns {object}
 */
function setProjectPackageManager(pmName, projectDir = process.cwd()) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`Unknown package manager: ${pmName}`);
  }

  const projectConfigDir = path.join(projectDir, '.claude');
  const projectConfigFile = path.join(projectConfigDir, 'package-manager.json');

  const configPayload = {
    packageManager: pmName,
    setAt: new Date().toISOString()
  };

  try {
    writeFile(projectConfigFile, JSON.stringify(configPayload, null, 2));
  } catch (err) {
    throw new Error(`Failed to save package manager config to ${projectConfigFile}: ${err.message}`);
  }
  return configPayload;
}

// Strict identifier whitelist to neutralize command injection vectors
const SAFE_NAME_REGEX = /^[@a-zA-Z0-9_./-]+$/;
const SAFE_ARGS_REGEX = /^[@a-zA-Z0-9\s_./:=,'"*+-]+$/;

/**
 * Build shell execution string for standard npm/yarn/pnpm/bun scripts
 * @param {string} script
 * @param {object} [options={}]
 * @returns {string}
 */
function getRunCommand(script, options = {}) {
  if (!script || typeof script !== 'string') {
    throw new Error('Script name must be a non-empty string');
  }
  if (!SAFE_NAME_REGEX.test(script)) {
    throw new Error(`Script name contains unsafe characters: ${script}`);
  }

  const resolved = getPackageManager(options);

  switch (script) {
    case 'install':
      return resolved.config.installCmd;
    case 'test':
      return resolved.config.testCmd;
    case 'build':
      return resolved.config.buildCmd;
    case 'dev':
      return resolved.config.devCmd;
    default:
      return `${resolved.config.runCmd} ${script}`;
  }
}

/**
 * Build execution command for arbitrary CLI binaries (npx, dlx, bunx)
 * @param {string} binary
 * @param {string} [args='']
 * @param {object} [options={}]
 * @returns {string}
 */
function getExecCommand(binary, args = '', options = {}) {
  if (!binary || typeof binary !== 'string') {
    throw new Error('Binary name must be a non-empty string');
  }
  if (!SAFE_NAME_REGEX.test(binary)) {
    throw new Error(`Binary name contains unsafe characters: ${binary}`);
  }
  if (args && typeof args === 'string' && !SAFE_ARGS_REGEX.test(args)) {
    throw new Error(`Arguments contain unsafe characters: ${args}`);
  }

  const resolved = getPackageManager(options);
  const suffix = args ? ` ${args}` : '';
  return `${resolved.config.execCmd} ${binary}${suffix}`;
}

/**
 * Generate human-readable guidance string when no preference is registered
 * @returns {string}
 */
function getSelectionPrompt() {
  const supported = Object.keys(PACKAGE_MANAGERS).join(', ');
  let info = '[PackageManager] No package manager preference detected.\n';
  info += `Supported package managers: ${supported}\n\n`;
  info += 'To set your preferred package manager:\n';
  info += '  - Global: Set CLAUDE_PACKAGE_MANAGER environment variable\n';
  info += '  - Or add to ~/.claude/package-manager.json: {"packageManager": "pnpm"}\n';
  info += '  - Or add to package.json: {"packageManager": "pnpm@8"}\n';
  info += '  - Or add a lock file to your project (e.g., pnpm-lock.yaml)\n';
  return info;
}

/**
 * Escape regular expression metacharacters
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate composite regex pattern matching an action across all package managers
 * @param {string} action
 * @returns {string}
 */
function getCommandPattern(action) {
  const trimmed = action.trim();
  const variations = [];

  if (trimmed === 'dev') {
    variations.push(
      'npm run dev',
      'pnpm( run)? dev',
      'yarn dev',
      'bun run dev'
    );
  } else if (trimmed === 'install') {
    variations.push(
      'npm install',
      'pnpm install',
      'yarn( install)?',
      'bun install'
    );
  } else if (trimmed === 'test') {
    variations.push(
      'npm test',
      'pnpm test',
      'yarn test',
      'bun test'
    );
  } else if (trimmed === 'build') {
    variations.push(
      'npm run build',
      'pnpm( run)? build',
      'yarn build',
      'bun run build'
    );
  } else {
    const escapedAction = escapeRegex(trimmed);
    variations.push(
      `npm run ${escapedAction}`,
      `pnpm( run)? ${escapedAction}`,
      `yarn ${escapedAction}`,
      `bun run ${escapedAction}`
    );
  }

  return `(${variations.join('|')})`;
}

module.exports = {
  PACKAGE_MANAGERS,
  DETECTION_PRIORITY,
  getPackageManager,
  setPreferredPackageManager,
  setProjectPackageManager,
  getAvailablePackageManagers,
  detectFromLockFile,
  detectFromPackageJson,
  getRunCommand,
  getExecCommand,
  getSelectionPrompt,
  getCommandPattern
};
