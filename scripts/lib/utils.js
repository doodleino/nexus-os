/**
 * Universal Agent OS - Core Cross-Platform System Utilities
 *
 * Provides robust, hermetic filesystem, execution, session, and string helpers
 * across Windows, macOS, and Linux runtime environments.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

const { resolveAgentDataHome } = require('./agent-data-home');

// Platform constants
const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Storage paths and directory layouts
const SESSION_DATA_DIR_NAME = 'session-data';
const LEGACY_SESSIONS_DIR_NAME = 'sessions';

// Windows DOS device reserved names to prevent collision or corruption
const WINDOWS_RESERVED_DEVICE_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

/**
 * Retrieve normalized user home directory across platforms
 * @returns {string} Absolute path to user home
 */
function getHomeDir() {
  const customHome = process.env.HOME || process.env.USERPROFILE;
  if (customHome && customHome.trim().length > 0) {
    return path.resolve(customHome);
  }
  return os.homedir();
}

/**
 * Root directory for persistent harness context and agent data
 * @returns {string} Data directory path
 */
function getAgentDataHome() {
  return resolveAgentDataHome();
}

/**
 * Compatibility alias for agent data root
 * @returns {string}
 */
function getClaudeDir() {
  return getAgentDataHome();
}

/**
 * Directory housing canonical session records
 * @returns {string}
 */
function getSessionsDir() {
  return path.join(getClaudeDir(), SESSION_DATA_DIR_NAME);
}

/**
 * Directory housing legacy session records
 * @returns {string}
 */
function getLegacySessionsDir() {
  return path.join(getClaudeDir(), LEGACY_SESSIONS_DIR_NAME);
}

/**
 * Ordered list of session search directories (canonical prioritized)
 * @returns {string[]}
 */
function getSessionSearchDirs() {
  return Array.from(new Set([getSessionsDir(), getLegacySessionsDir()]));
}

/**
 * Directory for dynamically synthesized/learned skills
 * @returns {string}
 */
function getLearnedSkillsDir() {
  return path.join(getClaudeDir(), 'skills', 'learned');
}

/**
 * System temporary directory
 * @returns {string}
 */
function getTempDir() {
  return os.tmpdir();
}

/**
 * Ensure a target directory exists recursively
 * @param {string} dirPath - Directory path
 * @returns {string} dirPath
 */
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    if (error && error.code !== 'EEXIST') {
      throw new Error(`Failed to create directory '${dirPath}': ${error.message}`);
    }
  }
  return dirPath;
}

/**
 * Format current local date as YYYY-MM-DD
 * @returns {string}
 */
function getDateString() {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format current local time as HH:MM
 * @returns {string}
 */
function getTimeString() {
  const current = new Date();
  const hours = String(current.getHours()).padStart(2, '0');
  const minutes = String(current.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format full timestamp as YYYY-MM-DD HH:MM:SS
 * @returns {string}
 */
function getDateTimeString() {
  const current = new Date();
  const dateStr = getDateString();
  const hours = String(current.getHours()).padStart(2, '0');
  const mins = String(current.getMinutes()).padStart(2, '0');
  const secs = String(current.getSeconds()).padStart(2, '0');
  return `${dateStr} ${hours}:${mins}:${secs}`;
}

/**
 * Query current Git repository top-level folder name
 * @returns {string|null}
 */
function getGitRepoName() {
  const execResult = runCommand('git rev-parse --show-toplevel');
  if (!execResult.success) return null;
  return path.basename(execResult.output);
}

/**
 * Detect project name from git repo or active working directory
 * @returns {string|null}
 */
function getProjectName() {
  const gitName = getGitRepoName();
  if (gitName) return gitName;
  return path.basename(process.cwd()) || null;
}

/**
 * Clean and sanitize an arbitrary identifier for safe usage in filesystem names
 * @param {string} raw - Input string
 * @returns {string|null} Sanitized session identifier
 */
function sanitizeSessionId(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const containsNonAscii = Array.from(raw).some(c => c.codePointAt(0) > 0x7f);
  const withoutLeadingDots = raw.replace(/^\.+/, '');
  const slug = withoutLeadingDots
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > 0) {
    const hashSuffix = crypto.createHash('sha256').update(withoutLeadingDots).digest('hex').slice(0, 6);
    if (WINDOWS_RESERVED_DEVICE_NAMES.has(slug.toUpperCase())) {
      return `${slug}-${hashSuffix}`;
    }
    if (!containsNonAscii) return slug;
    return `${slug}-${hashSuffix}`;
  }

  const alphanumericOnly = withoutLeadingDots.replace(/[\s\p{P}]/gu, '');
  if (alphanumericOnly.length === 0) return null;

  return crypto.createHash('sha256').update(withoutLeadingDots).digest('hex').slice(0, 8);
}

/**
 * Extract concise session identifier from environment or project context
 * @param {string} fallback - Fallback identifier
 * @returns {string} Short sanitized session ID
 */
function getSessionIdShort(fallback = 'default') {
  const sessionEnv = process.env.CLAUDE_SESSION_ID;
  if (sessionEnv && sessionEnv.length > 0) {
    const cleaned = sanitizeSessionId(sessionEnv.slice(-8));
    if (cleaned) return cleaned;
  }
  return sanitizeSessionId(getProjectName()) || sanitizeSessionId(fallback) || 'default';
}

/**
 * Search directory for files matching glob pattern with optional age and recursion filters
 * @param {string} dir - Directory to search
 * @param {string} pattern - Glob pattern (*.js, etc.)
 * @param {object} options - Search options
 * @returns {Array<{path: string, mtime: number}>}
 */
function findFiles(dir, pattern, options = {}) {
  if (!dir || typeof dir !== 'string') return [];
  if (!pattern || typeof pattern !== 'string') return [];

  const { maxAge = null, recursive = false } = options;
  const matches = [];

  if (!fs.existsSync(dir)) {
    return matches;
  }

  const regexSource = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const fileMatcher = new RegExp(`^${regexSource}$`);

  function traverse(targetDirectory) {
    try {
      const dirEntries = fs.readdirSync(targetDirectory, { withFileTypes: true });

      for (const item of dirEntries) {
        const fullItemPath = path.join(targetDirectory, item.name);

        if (item.isFile() && fileMatcher.test(item.name)) {
          let itemStats;
          try {
            itemStats = fs.statSync(fullItemPath);
          } catch {
            continue; // Transient deletion
          }

          if (maxAge !== null) {
            const fileAgeDays = (Date.now() - itemStats.mtimeMs) / (1000 * 60 * 60 * 24);
            if (fileAgeDays <= maxAge) {
              matches.push({ path: fullItemPath, mtime: itemStats.mtimeMs });
            }
          } else {
            matches.push({ path: fullItemPath, mtime: itemStats.mtimeMs });
          }
        } else if (item.isDirectory() && recursive) {
          traverse(fullItemPath);
        }
      }
    } catch {
      // Gracefully bypass unreadable directories
    }
  }

  traverse(dir);

  // Sort descending by modified timestamp
  matches.sort((left, right) => right.mtime - left.mtime);
  return matches;
}

/**
 * Asynchronously read and parse JSON payload from stdin
 * @param {object} options
 * @returns {Promise<object>}
 */
async function readStdinJson(options = {}) {
  const { timeoutMs = 5000, maxSize = 1024 * 1024 } = options;

  return new Promise((resolve) => {
    let rawBuffer = '';
    let isSettled = false;
    let limitExceeded = false;

    const timeoutHandle = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        process.stdin.removeAllListeners('data');
        process.stdin.removeAllListeners('end');
        process.stdin.removeAllListeners('error');
        if (process.stdin.unref) process.stdin.unref();

        if (limitExceeded) {
          resolve({});
          return;
        }
        try {
          resolve(rawBuffer.trim() ? JSON.parse(rawBuffer) : {});
        } catch {
          resolve({});
        }
      }
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (isSettled || limitExceeded) return;
      if (rawBuffer.length + chunk.length > maxSize) {
        limitExceeded = true;
        rawBuffer = '';
        process.stderr.write(
          `[readStdinJson] stdin exceeded ${maxSize} bytes; input truncated and treated as empty\n`
        );
        return;
      }
      rawBuffer += chunk;
    });

    process.stdin.on('end', () => {
      if (isSettled) {
        clearTimeout(timeoutHandle);
        return;
      }
      isSettled = true;
      clearTimeout(timeoutHandle);
      if (limitExceeded) {
        resolve({});
        return;
      }
      try {
        resolve(rawBuffer.trim() ? JSON.parse(rawBuffer) : {});
      } catch {
        resolve({});
      }
    });

    process.stdin.on('error', () => {
      if (isSettled) {
        clearTimeout(timeoutHandle);
        return;
      }
      isSettled = true;
      clearTimeout(timeoutHandle);
      resolve({});
    });
  });
}

/**
 * Standard operator log to stderr
 * @param {any} message
 */
function log(message) {
  console.error(message);
}

/**
 * Output formatted payload to stdout
 * @param {any} data
 */
function output(data) {
  if (typeof data === 'object') {
    console.log(JSON.stringify(data));
  } else {
    console.log(data);
  }
}

/**
 * Read text content from file safely
 * @param {string} filePath
 * @returns {string|null}
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Write utf-8 text file ensuring parent directory exists
 * @param {string} filePath
 * @param {string} content
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Append content to text file ensuring directory exists
 * @param {string} filePath
 * @param {string} content
 */
function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf8');
}

/**
 * Verify whether binary exists in system PATH
 * @param {string} cmd
 * @returns {boolean}
 */
function commandExists(cmd) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(cmd)) {
    return false;
  }

  try {
    const lookupTool = isWindows ? 'where' : 'which';
    const statusResult = spawnSync(lookupTool, [cmd], { stdio: 'pipe' });
    return statusResult.status === 0;
  } catch {
    return false;
  }
}

/**
 * Execute a vetted command string and return result
 * @param {string} cmd
 * @param {object} options
 * @returns {{success: boolean, output: string}}
 */
function runCommand(cmd, options = {}) {
  const allowedPrefixes = ['git ', 'node ', 'npx ', 'which ', 'where '];
  if (!allowedPrefixes.some(p => cmd.startsWith(p))) {
    return { success: false, output: 'runCommand blocked: unrecognized command prefix' };
  }

  const withoutQuotes = cmd.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '');
  if (/[;|&\n]/.test(withoutQuotes) || /[`$]/.test(cmd)) {
    return { success: false, output: 'runCommand blocked: shell metacharacters not allowed' };
  }

  try {
    const outputBuffer = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, output: outputBuffer.trim() };
  } catch (err) {
    return { success: false, output: err.stderr || err.message };
  }
}

/**
 * Test whether the active directory resides in a git repository
 * @returns {boolean}
 */
function isGitRepo() {
  return runCommand('git rev-parse --git-dir').success;
}

/**
 * Retrieve list of modified files in repository
 * @param {string[]} patterns
 * @returns {string[]}
 */
function getGitModifiedFiles(patterns = []) {
  if (!isGitRepo()) return [];

  const diffResult = runCommand('git diff --name-only HEAD');
  if (!diffResult.success) return [];

  let changedFiles = diffResult.output.split('\n').filter(Boolean);

  if (patterns.length > 0) {
    const validPatterns = [];
    for (const pat of patterns) {
      if (typeof pat !== 'string' || pat.length === 0) continue;
      try {
        validPatterns.push(new RegExp(pat));
      } catch {
        // Skip invalid expressions
      }
    }
    if (validPatterns.length > 0) {
      changedFiles = changedFiles.filter(item => validPatterns.some(regex => regex.test(item)));
    }
  }

  return changedFiles;
}

/**
 * Perform replacement inside a file
 * @param {string} filePath
 * @param {string|RegExp} search
 * @param {string} replace
 * @param {object} options
 * @returns {boolean}
 */
function replaceInFile(filePath, search, replace, options = {}) {
  const fileData = readFile(filePath);
  if (fileData === null) return false;

  try {
    let transformed;
    if (options.all && typeof search === 'string') {
      transformed = fileData.replaceAll(search, replace);
    } else {
      transformed = fileData.replace(search, replace);
    }
    writeFile(filePath, transformed);
    return true;
  } catch (err) {
    log(`[Utils] replaceInFile failed for ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Count occurrences of pattern in file
 * @param {string} filePath
 * @param {string|RegExp} pattern
 * @returns {number}
 */
function countInFile(filePath, pattern) {
  const content = readFile(filePath);
  if (content === null) return 0;

  let patternRegex;
  try {
    if (pattern instanceof RegExp) {
      patternRegex = new RegExp(
        pattern.source,
        pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
      );
    } else if (typeof pattern === 'string') {
      patternRegex = new RegExp(pattern, 'g');
    } else {
      return 0;
    }
  } catch {
    return 0;
  }

  const occurrences = content.match(patternRegex);
  return occurrences ? occurrences.length : 0;
}

/**
 * Strip ANSI escape control sequences from string
 * @param {string} str
 * @returns {string}
 */
function stripAnsi(str) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b(?:\[[0-9;?]*[A-Za-z]|\][^\x07\x1b]*(?:\x07|\x1b\\)|\([A-Z]|[A-Z])/g, '');
}

/**
 * Search file line-by-line for pattern
 * @param {string} filePath
 * @param {string|RegExp} pattern
 * @returns {Array<{lineNumber: number, content: string}>}
 */
function grepFile(filePath, pattern) {
  const content = readFile(filePath);
  if (content === null) return [];

  let searchRegex;
  try {
    if (pattern instanceof RegExp) {
      const nonGlobalFlags = pattern.flags.replace('g', '');
      searchRegex = new RegExp(pattern.source, nonGlobalFlags);
    } else {
      searchRegex = new RegExp(pattern);
    }
  } catch {
    return [];
  }

  const lines = content.split('\n');
  const matchedLines = [];

  lines.forEach((lineText, idx) => {
    if (searchRegex.test(lineText)) {
      matchedLines.push({ lineNumber: idx + 1, content: lineText });
    }
  });

  return matchedLines;
}

module.exports = {
  // Platform markers
  isWindows,
  isMacOS,
  isLinux,

  // Location helpers
  getHomeDir,
  getAgentDataHome,
  getClaudeDir,
  getSessionsDir,
  getLegacySessionsDir,
  getSessionSearchDirs,
  getLearnedSkillsDir,
  getTempDir,
  ensureDir,

  // Time & Date formatters
  getDateString,
  getTimeString,
  getDateTimeString,

  // Project / Session naming
  sanitizeSessionId,
  getSessionIdShort,
  getGitRepoName,
  getProjectName,

  // File mutations & inspections
  findFiles,
  readFile,
  writeFile,
  appendFile,
  replaceInFile,
  countInFile,
  grepFile,

  // Sanitization
  stripAnsi,

  // Stream & Output
  readStdinJson,
  log,
  output,

  // System & Git
  commandExists,
  runCommand,
  isGitRepo,
  getGitModifiedFiles
};
