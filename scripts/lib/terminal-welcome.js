'use strict';

const { version: NEXUS_VERSION } = require('../../package.json');

const COMMUNITY_LINKS = Object.freeze({
  github: 'https://github.com/nexus-os/nexus-os',
  website: 'https://nexusos-dev.vercel.app',
  email: 'doodleino@gmail.com',
});

const SUCCESS_ACTIONS = Object.freeze([
  'installed',
  'updated',
  'migrated',
  'resumed',
  'already-migrated',
  'configured',
]);
const SUCCESS_MESSAGES = Object.freeze({
  installed: 'Welcome to NEXUS-OS!',
  updated: 'NEXUS-OS is updated — thank you for using NEXUS-OS!',
  migrated: 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
  resumed: 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
  'already-migrated': 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
  configured: 'NEXUS-OS is configured — thank you for using NEXUS-OS!',
});

// Clean cyber block typography for NEXUS
const NEXUS_WORDMARK = Object.freeze([
  ' ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗',
  ' ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝',
  ' ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗',
  ' ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║',
  ' ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║',
  ' ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
]);

const NEXUS_GRADIENT = Object.freeze({
  start: Object.freeze({ red: 0, green: 240, blue: 255 }), // Electric Cyan
  end: Object.freeze({ red: 138, green: 43, blue: 226 }),  // Electric Violet
});

const NEXUS_VERSION_PATTERN = /^[0-9]+(?:\.[0-9]+){2}(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const WORDMARK_START_COLUMN = Math.min(...NEXUS_WORDMARK.map(line => line.search(/\S/)));
const WORDMARK_END_COLUMN = Math.max(
  ...NEXUS_WORDMARK.map(line => line.trimEnd().length - 1)
);

function colorize(value, code, enabled) {
  return enabled ? `\x1b[${code}m${value}\x1b[0m` : value;
}

function interpolateChannel(start, end, ratio) {
  return Math.round(start + ((end - start) * ratio));
}

function gradientColorAt(column) {
  const span = WORDMARK_END_COLUMN - WORDMARK_START_COLUMN;
  const ratio = span === 0 ? 0 : (column - WORDMARK_START_COLUMN) / span;
  return {
    red: interpolateChannel(NEXUS_GRADIENT.start.red, NEXUS_GRADIENT.end.red, ratio),
    green: interpolateChannel(NEXUS_GRADIENT.start.green, NEXUS_GRADIENT.end.green, ratio),
    blue: interpolateChannel(NEXUS_GRADIENT.start.blue, NEXUS_GRADIENT.end.blue, ratio),
  };
}

function renderWordmark(color) {
  if (!color) return NEXUS_WORDMARK.join('\n');

  return NEXUS_WORDMARK.map(line => (
    [...line].map((character, column) => {
      if (character === ' ') return character;
      const value = gradientColorAt(column);
      return `\x1b[38;2;${value.red};${value.green};${value.blue}m${character}`;
    }).join('') + '\x1b[0m'
  )).join('\n');
}

function renderCommunityLinks() {
  const rows = Object.freeze([
    `GitHub:  ${COMMUNITY_LINKS.github}`,
    `Website: ${COMMUNITY_LINKS.website}`,
    `Email:   ${COMMUNITY_LINKS.email}`,
  ]);
  const contentWidth = Math.max(...rows.map(row => row.length));
  const border = '─'.repeat(contentWidth + 2);

  return [
    `  ╭${border}╮`,
    ...rows.map(row => `  │ ${row.padEnd(contentWidth)} │`),
    `  ╰${border}╯`,
  ];
}

function renderTerminalWelcome(options = {}) {
  const color = options.color === true;
  const installedVersion = options.version || NEXUS_VERSION;
  if (!NEXUS_VERSION_PATTERN.test(installedVersion)) {
    throw new Error(`Invalid NEXUS-OS version: ${installedVersion}`);
  }
  const graphic = renderWordmark(color);
  const successMessage = SUCCESS_MESSAGES[options.action] || SUCCESS_MESSAGES.installed;
  const welcomeMessage = colorize(successMessage, '1;36', color);
  const version = colorize(`v${installedVersion}`, '2', color);
  const versionLine = color ? `\x1b[1G  ${version}` : `  ${version}`;
  const subtitle = colorize('72 Autonomous Agents · 310 Workflow Skills · 100% Deterministic', '38;2;0;240;255', color);
  const subtitleLine = color ? `\x1b[1G  ${subtitle}` : '  72 Autonomous Agents · 310 Workflow Skills · 100% Deterministic';

  return [
    '',
    graphic,
    '',
    `  ${welcomeMessage}`,
    versionLine,
    subtitleLine,
    '',
    ...renderCommunityLinks(),
    '',
  ].join('\n');
}

function showTerminalWelcome(options = {}) {
  const {
    action,
    dryRun = false,
    env = process.env,
    interactive = false,
    json = false,
    output = process.stdout,
  } = options;
  const shouldShow = (
    interactive
    && output.isTTY === true
    && !dryRun
    && !json
    && SUCCESS_ACTIONS.includes(action)
  );
  if (!shouldShow) return false;

  const color = env.NO_COLOR === undefined && env.TERM !== 'dumb';
  output.write(renderTerminalWelcome({ action, color }));
  return true;
}

module.exports = {
  COMMUNITY_LINKS,
  NEXUS_VERSION_PATTERN,
  renderTerminalWelcome,
  showTerminalWelcome,
};
