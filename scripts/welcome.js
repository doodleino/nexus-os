#!/usr/bin/env node

/**
 * Universal Agent OS - Terminal Welcome Artwork & Status Banner
 *
 * Emits visual initialization art and telemetry links for interactive sessions.
 */

'use strict';

const {
  NEXUS_VERSION_PATTERN,
  renderTerminalWelcome,
} = require('./lib/terminal-welcome');

// Recognized lifecycle action states
const PERMITTED_ACTIONS = new Set([
  'installed',
  'updated',
  'configured',
  'migrated',
  'resumed',
  'already-migrated',
]);

/**
 * Parse and validate CLI arguments for welcome banner
 * @param {string[]} argv
 * @returns {{action: string, version?: string}}
 */
function parseArgs(argv) {
  let selectedAction = 'installed';
  let targetVersion;

  for (let cursor = 0; cursor < argv.length; cursor++) {
    const flag = argv[cursor];

    if (flag === '--action') {
      const paramVal = argv[cursor + 1];
      if (!paramVal || paramVal.startsWith('--')) {
        throw new Error('Missing value for --action');
      }
      selectedAction = paramVal;
      cursor++;
    } else if (flag === '--version') {
      const verVal = argv[cursor + 1];
      if (!verVal || verVal.startsWith('--')) {
        throw new Error('Missing value for --version');
      }
      targetVersion = verVal;
      cursor++;
    } else {
      throw new Error('Unknown argument');
    }
  }

  if (!PERMITTED_ACTIONS.has(selectedAction)) {
    throw new Error('Invalid --action value');
  }

  if (targetVersion !== undefined && !NEXUS_VERSION_PATTERN.test(targetVersion)) {
    throw new Error('Invalid --version value');
  }

  return { action: selectedAction, version: targetVersion };
}

/**
 * Main execution handler
 * @param {string[]} [argv=process.argv.slice(2)]
 */
function main(argv = process.argv.slice(2)) {
  try {
    const { action, version } = parseArgs(argv);
    const supportsAnsi = process.env.NO_COLOR === undefined
      && process.env.TERM !== 'dumb'
      && Boolean(process.stdout.isTTY);

    const bannerText = renderTerminalWelcome({
      action,
      color: supportsAnsi,
      version,
    });

    process.stdout.write(bannerText);
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
