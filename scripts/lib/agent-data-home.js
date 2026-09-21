/**
 * Universal Agent OS - Multi-Harness Agent Data Home Resolver
 *
 * Resolves root persistence and memory directories across Claude, Cursor,
 * Codex, and custom multi-agent harness configurations.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { assertWithinTrustedRoot } = require('./path-safety');

const AGENT_DATA_HOME_ENV = 'NEXUS_AGENT_DATA_HOME';
const DEFAULT_CLAUDE_DIR_NAME = '.claude';
const DEFAULT_CURSOR_NEXUS_DIR_SEGMENTS = ['.cursor', 'nexus'];
const PROJECT_CONFIG_RELATIVE = path.join('.cursor', 'nexus-agent-data.json');

/**
 * Retrieve environment home directory for tilde expansion
 * @returns {string}
 */
function getHomeDirFromEnv() {
  const explicit = process.env.HOME || process.env.USERPROFILE;
  if (explicit && String(explicit).trim().length > 0) {
    return path.resolve(explicit);
  }
  return os.homedir();
}

/**
 * Expand tilde and relative paths against an optional base directory
 * @param {string} rawPath
 * @param {string} [baseDir]
 * @returns {string|null}
 */
function expandHomePath(rawPath, baseDir) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const cleaned = rawPath.trim();
  if (!cleaned) return null;

  if (cleaned.startsWith('~')) {
    const trailing = cleaned.slice(1).replace(/^[/\\]+/, '');
    return trailing ? path.join(getHomeDirFromEnv(), trailing) : getHomeDirFromEnv();
  }

  if (path.isAbsolute(cleaned)) {
    return path.resolve(cleaned);
  }

  const effectiveBase = baseDir && String(baseDir).trim()
    ? path.resolve(baseDir)
    : process.cwd();
  return path.resolve(effectiveBase, cleaned);
}

/**
 * Resolve project root given path to .cursor/nexus-agent-data.json
 * @param {string} configPath
 * @returns {string}
 */
function resolveProjectRootFromConfigPath(configPath) {
  const parentFolder = path.dirname(path.resolve(configPath));
  if (path.basename(parentFolder) === '.cursor') {
    return path.dirname(parentFolder);
  }
  return parentFolder;
}

/**
 * Determine if current process is invoked within a Cursor hook
 * @returns {boolean}
 */
function isCursorHookRuntime() {
  if (process.env.CURSOR_VERSION && String(process.env.CURSOR_VERSION).trim()) {
    return true;
  }
  if (process.env.CURSOR_PROJECT_DIR && String(process.env.CURSOR_PROJECT_DIR).trim()) {
    return true;
  }
  return false;
}

/**
 * Default agent data path for Cursor harness (~/.cursor/nexus)
 * @returns {string}
 */
function getDefaultCursorAgentDataHome() {
  return path.join(getHomeDirFromEnv(), ...DEFAULT_CURSOR_NEXUS_DIR_SEGMENTS);
}

/**
 * Default agent data path for Claude harness (~/.claude)
 * @returns {string}
 */
function getDefaultClaudeAgentDataHome() {
  return path.join(getHomeDirFromEnv(), DEFAULT_CLAUDE_DIR_NAME);
}

/**
 * Emit warning when project config attempts an unsafe agentDataHome path
 */
function warnUnsafeProjectConfig() {
  console.error(
    '[NEXUS] Ignoring unsafe agent data project config: agentDataHome must stay ' +
    'within the default Cursor or Claude data directories. Use ' +
    'NEXUS_AGENT_DATA_HOME for an explicit trusted override.'
  );
}

/**
 * Check syntax safety of candidate data home
 * @param {string} candidate
 * @returns {boolean}
 */
function isSafeProjectConfigSyntax(candidate) {
  const trimmed = candidate.trim();
  const isAnchored = trimmed.startsWith('~') || path.isAbsolute(trimmed);
  const segments = trimmed.split(/[/\\]+/);
  return isAnchored && !segments.includes('..');
}

/**
 * Validate that candidate path resides within permitted harness root boundaries
 * @param {string} candidate
 * @returns {string|null}
 */
function resolveAllowedProjectConfigHome(candidate) {
  const allowedRoots = [
    getDefaultCursorAgentDataHome(),
    getDefaultClaudeAgentDataHome()
  ];

  for (const root of allowedRoots) {
    try {
      return assertWithinTrustedRoot(
        candidate,
        root,
        'use project agent data home'
      );
    } catch {
      // Continue checking next permitted root
    }
  }
  return null;
}

/**
 * Parse project-level configuration file if present
 * @param {string} configPath
 * @returns {string|null}
 */
function readProjectConfigAt(configPath) {
  if (!configPath || typeof configPath !== 'string') return null;
  if (!fs.existsSync(configPath)) return null;

  try {
    const rawContent = fs.readFileSync(configPath, 'utf8');
    const parsedData = JSON.parse(rawContent);
    if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
      return null;
    }

    const candidate = parsedData.agentDataHome || parsedData.NEXUS_AGENT_DATA_HOME;
    if (typeof candidate !== 'string' || !candidate.trim()) return null;

    if (!isSafeProjectConfigSyntax(candidate)) {
      warnUnsafeProjectConfig();
      return null;
    }

    const projectRoot = resolveProjectRootFromConfigPath(configPath);
    const expandedCandidate = expandHomePath(candidate, projectRoot);
    const verifiedPath = resolveAllowedProjectConfigHome(expandedCandidate);

    if (!verifiedPath) {
      warnUnsafeProjectConfig();
      return null;
    }

    return verifiedPath;
  } catch (err) {
    console.error(
      `[NEXUS] Failed to read or parse agent data config at ${configPath}: ${err.message}`
    );
    return null;
  }
}

/**
 * Read configuration file relative to specified project directory
 * @param {string} projectDir
 * @returns {string|null}
 */
function readProjectConfig(projectDir) {
  if (!projectDir || typeof projectDir !== 'string') return null;
  const resolved = path.resolve(projectDir);
  const nexusConfig = path.join(resolved, '.cursor', 'nexus-agent-data.json');
  if (fs.existsSync(nexusConfig)) {
    return readProjectConfigAt(nexusConfig);
  }
  const targetConfig = path.join(resolved, PROJECT_CONFIG_RELATIVE);
  return readProjectConfigAt(targetConfig);
}

/**
 * Heuristically determine project root directory
 * @returns {string}
 */
function resolveProjectDir() {
  const candidateDirs = [
    process.env.CURSOR_PROJECT_DIR,
    process.env.CLAUDE_PROJECT_DIR,
    process.cwd()
  ];

  for (const candidate of candidateDirs) {
    if (!candidate || typeof candidate !== 'string') continue;
    const absPath = path.resolve(candidate);
    if (fs.existsSync(path.join(absPath, '.cursor'))) {
      return absPath;
    }
  }

  return process.cwd();
}

/**
 * Resolve effective agent data home without mutating current environment
 * @param {object} options
 * @returns {string}
 */
function resolveAgentDataHome(options = {}) {
  const envVal = expandHomePath(process.env.NEXUS_AGENT_DATA_HOME || process.env[AGENT_DATA_HOME_ENV]);
  if (envVal) return envVal;

  const activeProjectDir = options.projectDir || resolveProjectDir();
  const projectVal = readProjectConfig(activeProjectDir);
  if (projectVal) return projectVal;

  if (options.preferCursorDefault === true || isCursorHookRuntime()) {
    return getDefaultCursorAgentDataHome();
  }

  return getDefaultClaudeAgentDataHome();
}

/**
 * Guarantee NEXUS_AGENT_DATA_HOME is populated on process.env
 * @param {object} options
 * @returns {string}
 */
function ensureAgentDataHomeEnv(options = {}) {
  const targetHome = resolveAgentDataHome(options);
  if (!expandHomePath(process.env[AGENT_DATA_HOME_ENV])) {
    process.env[AGENT_DATA_HOME_ENV] = targetHome;
  }
  return targetHome;
}

/**
 * Build environment dictionary for Cursor session hooks
 * @param {object} options
 * @returns {object}
 */
function getCursorSessionEnvPayload(options = {}) {
  const resolvedHome = resolveAgentDataHome({
    ...options,
    preferCursorDefault: true
  });

  return {
    NEXUS_AGENT_DATA_HOME: resolvedHome
  };
}

module.exports = {
  AGENT_DATA_HOME_ENV,
  DEFAULT_CLAUDE_DIR_NAME,
  DEFAULT_CURSOR_NEXUS_DIR_SEGMENTS,
  PROJECT_CONFIG_RELATIVE,
  expandHomePath,
  resolveProjectRootFromConfigPath,
  isCursorHookRuntime,
  getDefaultCursorAgentDataHome,
  getDefaultClaudeAgentDataHome,
  readProjectConfig,
  readProjectConfigAt,
  resolveProjectDir,
  resolveAgentDataHome,
  ensureAgentDataHomeEnv,
  getCursorSessionEnvPayload
};
