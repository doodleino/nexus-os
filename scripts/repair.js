#!/usr/bin/env node

/**
 * Universal Agent OS - State-Driven File Restoration & Drift Healing
 *
 * Restores drifted, modified, or missing managed files according to the active
 * installation plan and recorded install-state.
 */

'use strict';

const path = require('path');
const os = require('os');
const { repairInstalledStates } = require('./lib/install-lifecycle');
const { SUPPORTED_INSTALL_TARGETS } = require('./lib/install-manifests');
const { problemReportLines } = require('./lib/feedback-links');

/**
 * Output repair usage documentation
 * @param {number} [exitCode=0]
 */
function showHelp(exitCode = 0) {
  const targetsFormatted = SUPPORTED_INSTALL_TARGETS.join('|');
  console.log(`
Usage: node scripts/repair.js [--target <${targetsFormatted}>] [--dry-run] [--json]

Rebuild NEXUS-managed files recorded in install-state for the current context.
`);
  process.exit(exitCode);
}

/**
 * Parse input options for repair operation
 * @param {string[]} argv
 * @returns {{targets: string[], dryRun: boolean, json: boolean, help: boolean}}
 */
function parseArgs(argv) {
  const cliTokens = argv.slice(2);
  const options = {
    targets: [],
    dryRun: false,
    json: false,
    help: false,
  };

  for (let idx = 0; idx < cliTokens.length; idx++) {
    const token = cliTokens[idx];

    if (token === '--target') {
      options.targets.push(cliTokens[idx + 1] || null);
      idx++;
    } else if (token === '--dry-run') {
      options.dryRun = true;
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

/**
 * Render human-readable repair summary
 * @param {object} outcome
 */
function printHuman(outcome) {
  if (outcome.results.length === 0) {
    console.log('No NEXUS install-state files found for the current home/project context.');
    return;
  }

  console.log('Repair summary:\n');
  for (const entry of outcome.results) {
    console.log(`- ${entry.adapter.id}`);
    console.log(`  Status: ${entry.status.toUpperCase()}`);
    console.log(`  Install-state: ${entry.installStatePath}`);

    if (entry.error) {
      console.log(`  Error: ${entry.error}`);
      continue;
    }

    const fileList = outcome.dryRun ? entry.plannedRepairs : entry.repairedPaths;
    const label = outcome.dryRun ? 'Planned repairs' : 'Repaired paths';
    console.log(`  ${label}: ${fileList.length}`);
  }

  const { checkedCount, plannedRepairCount, repairedCount, errorCount } = outcome.summary;
  const countDisplay = outcome.dryRun ? plannedRepairCount : repairedCount;
  const countLabel = outcome.dryRun ? 'planned' : 'repaired';

  console.log(`\nSummary: checked=${checkedCount}, ${countLabel}=${countDisplay}, errors=${errorCount}`);

  if (errorCount > 0) {
    console.log(`\n${problemReportLines().join('\n')}`);
  }
}

/**
 * Main execution handler
 */
async function main() {
  try {
    const opts = parseArgs(process.argv);
    if (opts.help) {
      showHelp(0);
    }

    const outcome = repairInstalledStates({
      repoRoot: path.join(__dirname, '..'),
      homeDir: process.env.HOME || os.homedir(),
      env: process.env,
      projectRoot: process.cwd(),
      targets: opts.targets,
      dryRun: opts.dryRun,
    });

    if (!opts.dryRun) {
      const { reconcileCanonicalInstallStates } = require('./lib/install-state-store-sync');
      outcome.installStateProjection = await reconcileCanonicalInstallStates({
        homeDir: process.env.HOME || os.homedir(),
        env: process.env,
        projectRoot: process.cwd(),
        targets: opts.targets,
      });
    }

    const failed = outcome.summary.errorCount > 0;

    if (opts.json) {
      console.log(JSON.stringify(outcome, null, 2));
    } else {
      printHuman(outcome);
    }

    process.exitCode = failed ? 1 : 0;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
