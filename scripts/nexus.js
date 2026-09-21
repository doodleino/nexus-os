#!/usr/bin/env node

/**
 * NEXUS-OS Master CLI Dispatcher
 *
 * The unified command-line entrypoint for the Autonomous Agent Operating System.
 * Dispatches to specialized lifecycle, diagnostics, planning, and harness tooling.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const { listAvailableLanguages } = require('./lib/install-executor');
const { getComputeSponsorCopy } = require('./lib/compute-sponsor');
const { createSafeItoInvocationEnvironment, getInvocationCommand } = require('./lib/ito-environment');

const COMMANDS = {
  setup: {
    script: 'setup.js',
    description: 'Launch the guided interactive setup wizard for Claude Code, Codex, and other harnesses',
  },
  welcome: {
    script: 'welcome.js',
    description: 'Display the sovereign NEXUS-OS wordmark, active capabilities, and system documentation',
  },
  install: {
    script: 'install-apply.js',
    description: 'Install or update NEXUS-OS components, skills, agents, and harness adapters',
  },
  plan: {
    script: 'install-plan.js',
    description: 'Inspect selective-install manifests, component dependencies, and resolved plans',
  },
  catalog: {
    script: 'catalog.js',
    description: 'Query and explore the catalog of 72 agents, 350 skills, and 106 command workflows',
  },
  consult: {
    script: 'consult.js',
    description: 'Recommend relevant skills and install profiles from natural-language queries',
  },
  'control-pane': {
    script: 'control-pane.js',
    description: 'Launch the local high-performance operator control pane web dashboard',
  },
  memory: {
    script: 'memory.js',
    description: 'Manage persistent cross-session SQLite memory vault and cross-harness handoffs',
  },
  'install-plan': {
    script: 'install-plan.js',
    description: 'Inspect resolved selective-install execution plan (alias for plan)',
  },
  'list-installed': {
    script: 'list-installed.js',
    description: 'Inspect active install-state manifests across local projects and global user scope',
  },
  doctor: {
    script: 'doctor.js',
    description: 'Run comprehensive diagnostics and verify agent harness health and path containment',
  },
  feedback: {
    script: 'feedback.js',
    description: 'Direct feedback and telemetry channel for bug reports and architectural suggestions',
  },
  repair: {
    script: 'repair.js',
    description: 'Reconcile drifted, missing, or corrupted agent definitions and harness adapters',
  },
  'auto-update': {
    script: 'auto-update.js',
    description: 'Pull latest NEXUS-OS enhancements and update active harnesses idempotently',
  },
  status: {
    script: 'status.js',
    description: 'Display active state store statistics, installed agents, and execution metrics',
  },
  'platform-audit': {
    script: 'platform-audit.js',
    description: 'Audit repository readiness, governance compliance, and security gates',
  },
  'security-ioc-scan': {
    script: 'ci/scan-supply-chain-iocs.js',
    description: 'Scan dependencies, scripts, and agent workspaces for supply chain risks',
  },
  sessions: {
    script: 'sessions-cli.js',
    description: 'List, inspect, and resume persistent agent execution sessions',
  },
  'work-items': {
    script: 'work-items.js',
    description: 'Synchronize task items across local plans, GitHub Issues, and tracking boards',
  },
  'session-inspect': {
    script: 'session-inspect.js',
    description: 'Extract and inspect structured session state from agent harness logs',
  },
  'loop-status': {
    script: 'loop-status.js',
    description: 'Inspect autonomous loop execution, tool wakeup queues, and pending actions',
  },
  uninstall: {
    script: 'uninstall.js',
    description: 'Cleanly uninstall NEXUS-OS components recorded in install-state',
  },
  ito: {
    script: 'ito.js',
    description: 'Invoke compute CLI adapter',
  },
  nasiko: {
    script: 'nasiko.js',
    description: 'CLI lifecycle bridge',
  },
};

const PRIMARY_COMMANDS = [
  'setup',
  'welcome',
  'install',
  'plan',
  'catalog',
  'consult',
  'control-pane',
  'memory',
  'list-installed',
  'doctor',
  'feedback',
  'repair',
  'auto-update',
  'status',
  'platform-audit',
  'security-ioc-scan',
  'sessions',
  'work-items',
  'session-inspect',
  'loop-status',
  'uninstall',
];

function showHelp(exitCode = 0) {
  process.stdout.write(`
NEXUS-OS selective-install CLI

Usage:
  nexus <command> [args...]
  nexus [install args...]
  nexus --dry-run <command> [args...]

Commands:
${PRIMARY_COMMANDS.map(command => `  ${command.padEnd(18)} ${COMMANDS[command].description}`).join('\n')}

Compatibility:
  nexus-install      Direct installation entrypoint for automated pipelines
  nexus [args...]    Without a subcommand, arguments are routed to "install"
  nexus help <cmd>   Display detailed help for a specific subcommand

Global Flags:
  --dry-run          Preview operations without writing changes (sets NEXUS_DRY_RUN=1)
  --json             Emit structured JSON output where supported
  --verbose          Enable detailed execution logs

Compute:
  ${getComputeSponsorCopy ? getComputeSponsorCopy() : 'Sovereign local-first compute.'}

Examples:
  nexus setup
  nexus setup --scope user --hooks standard --yes
  nexus welcome
  nexus install --guided
  nexus install --profile developer --target claude
  nexus plan --profile core --target cursor
  nexus catalog profiles
  nexus catalog components --family language
  nexus catalog show framework:nextjs
  nexus consult "security reviews"
  nexus control-pane --port 8765
  nexus memory search "architectural decisions"
  nexus list-installed --json
  nexus doctor --target claude
  nexus repair --dry-run
  nexus status --json
`);

  process.exit(exitCode);
}

function resolveCommand(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    return { mode: 'help' };
  }

  if (args.includes('--dry-run')) {
    process.env.NEXUS_DRY_RUN = '1';
  }

  let cmdStart = 0;
  while (cmdStart < args.length && args[cmdStart] === '--dry-run') {
    cmdStart++;
  }

  if (cmdStart >= args.length) {
    return { mode: 'help' };
  }

  const firstArg = args[cmdStart];
  const restArgs = args.slice(cmdStart + 1);

  if (firstArg === '--help' || firstArg === '-h') {
    return { mode: 'help' };
  }

  if (firstArg === 'help') {
    return {
      mode: 'help-command',
      command: restArgs[0] || null,
    };
  }

  if (COMMANDS[firstArg]) {
    return {
      mode: 'command',
      command: firstArg,
      args: restArgs,
    };
  }

  let knownLegacyLanguages = [];
  try {
    knownLegacyLanguages = listAvailableLanguages();
  } catch (_) {
    knownLegacyLanguages = ['typescript', 'python', 'javascript', 'rust', 'go', 'cpp'];
  }

  const shouldTreatAsImplicitInstall = (
    firstArg.startsWith('-')
    || knownLegacyLanguages.includes(firstArg)
  );

  if (!shouldTreatAsImplicitInstall) {
    throw new Error(`Unknown command: ${firstArg}`);
  }

  return {
    mode: 'command',
    command: 'install',
    args,
  };
}

function runCommand(commandName, args) {
  const command = COMMANDS[commandName];
  if (!command) {
    throw new Error(`Unknown command: ${commandName}`);
  }

  const scriptPath = path.join(__dirname, command.script);

  const isItoLogin = commandName === 'ito' && getInvocationCommand(args) === 'login';
  const result = spawnSync(
    process.execPath,
    [scriptPath, ...args],
    {
      cwd: process.cwd(),
      env: commandName === 'ito'
        ? {
          ...createSafeItoInvocationEnvironment(process.env, args, {
            includeControls: true,
          }),
        }
        : process.env,
      stdio: isItoLogin || commandName === 'setup' || commandName === 'install'
        ? 'inherit'
        : commandName === 'memory'
          ? ['inherit', 'pipe', 'pipe']
          : ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (typeof result.status === 'number') {
    return result.status;
  }

  if (result.signal) {
    throw new Error(`Command "${commandName}" terminated by signal ${result.signal}`);
  }

  return 1;
}

function main() {
  try {
    const resolution = resolveCommand(process.argv);

    if (resolution.mode === 'help') {
      showHelp(0);
      return;
    }

    if (resolution.mode === 'help-command') {
      if (!resolution.command) {
        showHelp(0);
        return;
      }

      if (!COMMANDS[resolution.command]) {
        throw new Error(`Unknown command: ${resolution.command}`);
      }

      process.exitCode = runCommand(resolution.command, ['--help']);
      return;
    }

    process.exitCode = runCommand(resolution.command, resolution.args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  COMMANDS,
  PRIMARY_COMMANDS,
  resolveCommand,
  runCommand,
};
