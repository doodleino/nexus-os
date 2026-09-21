#!/usr/bin/env node

/**
 * Universal Agent OS - System Health Diagnostics & State Inspector
 *
 * Inspects managed state files, detects file drift, unmanaged mutations,
 * and reports actionable issues per target harness.
 */

'use strict';

const path = require('path');
const os = require('os');
const { buildDoctorReport } = require('./lib/install-lifecycle');
const { SUPPORTED_INSTALL_TARGETS } = require('./lib/install-manifests');
const { problemReportLines } = require('./lib/feedback-links');

/**
 * Display CLI usage information and terminate
 * @param {number} [exitCode=0]
 */
function showHelp(exitCode = 0) {
  const targetList = SUPPORTED_INSTALL_TARGETS.join('|');
  console.log(`
Usage: node scripts/doctor.js [--target <${targetList}>] [--json]

Diagnose drift and missing managed files for NEXUS install-state in the current context.
`);
  process.exit(exitCode);
}

/**
 * Parse arguments for doctor diagnostic run
 * @param {string[]} argv
 * @returns {{targets: string[], json: boolean, help: boolean}}
 */
function parseArgs(argv) {
  const inputTokens = argv.slice(2);
  const options = {
    targets: [],
    json: false,
    help: false,
  };

  for (let idx = 0; idx < inputTokens.length; idx++) {
    const token = inputTokens[idx];

    if (token === '--target') {
      options.targets.push(inputTokens[idx + 1] || null);
      idx++;
    } else if (token === '--json') {
      options.json = true;
    } else if (token === '--help' || token === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  return options;
}

function colorize(value, code, enabled) {
  return enabled ? `\x1b[${code}m${value}\x1b[0m` : value;
}

/**
 * Convert status key to uppercase label
 * @param {string} status
 * @param {boolean} [enabled=false]
 * @returns {string}
 */
function statusLabel(status, enabled = false) {
  if (status === 'ok') return colorize('OK', '1;32', enabled);
  if (status === 'warning') return colorize('WARNING', '1;33', enabled);
  if (status === 'error') return colorize('ERROR', '1;31', enabled);
  return colorize(status.toUpperCase(), '1', enabled);
}

/**
 * Format report for human console viewing
 * @param {object} report
 */
function printHuman(report) {
  const useColor = process.env.NO_COLOR === undefined && Boolean(process.stdout.isTTY) && process.env.TERM !== 'dumb';
  if (report.results.length === 0) {
    console.log('No NEXUS install-state files found for the current home/project context.');
    console.log(`\n${problemReportLines().join('\n')}`);
    return;
  }

  console.log((useColor ? colorize('Doctor report:', '1;36', true) : 'Doctor report:') + '\n');
  for (const entry of report.results) {
    console.log(`- ${colorize(entry.adapter.id, '1', useColor)}`);
    console.log(`  Status: ${statusLabel(entry.status, useColor)}`);
    console.log(`  Install-state: ${entry.installStatePath}`);

    if (entry.issues.length === 0) {
      console.log(`  Issues: ${colorize('none', '32', useColor)}`);
      continue;
    }

    for (const defect of entry.issues) {
      const tag = defect.severity === 'error' ? colorize('[ERROR]', '1;31', useColor) : colorize('[WARN]', '1;33', useColor);
      console.log(`  - ${tag} ${defect.code}: ${defect.message}`);
    }
  }

  const { checkedCount, okCount, warningCount, errorCount } = report.summary;
  const summaryText = `Summary: checked=${checkedCount}, ok=${okCount}, warnings=${warningCount}, errors=${errorCount}`;
  console.log(`\n${colorize(summaryText, errorCount > 0 ? '1;31' : '1;32', useColor)}`);

  if (errorCount > 0 || warningCount > 0) {
    console.log(`\n${problemReportLines().join('\n')}`);
  }
}

/**
 * Main execution handler
 */
function main() {
  try {
    const opts = parseArgs(process.argv);
    if (opts.help) {
      showHelp(0);
    }

    const report = buildDoctorReport({
      repoRoot: path.join(__dirname, '..'),
      homeDir: process.env.HOME || os.homedir(),
      env: process.env,
      projectRoot: process.cwd(),
      targets: opts.targets,
    });

    const isUnhealthy = report.summary.errorCount > 0 || report.summary.warningCount > 0;

    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHuman(report);
    }

    process.exitCode = isUnhealthy ? 1 : 0;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
