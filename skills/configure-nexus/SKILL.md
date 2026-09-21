---
name: configure-nexus
description: Guide NEXUS-OS installation, update, or reconfiguration from inside Claude Code, Codex, or Kimi while respecting each harness's real plugin, scope, and hook capabilities.
metadata:
  origin: NEXUS-OS
---

# Configure NEXUS-OS

Run a conversational wizard inside the current harness: inventory first, collect only supported choices, preview, confirm once, apply non-interactively, verify, and show the welcome only after success. Never clone NEXUS-OS into a temporary directory or copy plugin components by hand.

For a human-operated terminal, the canonical entry points are `nexus setup` and `npx nexus-os setup`. Inside a harness, use the explicit non-interactive commands below instead.

## Route by the current harness

- In Claude Code, use the full scope-and-hook wizard below.
- In Codex, use Codex's native plugin lifecycle. Do not offer Claude scopes or map Claude's four hook profiles onto Codex.
- In Kimi, install the project surface under `./.kimi-code`; Kimi does not support lifecycle hook profiles.
- If the harness is uncertain, state the detected evidence and ask which harness to configure before running a mutating command.

This skill is a post-install reconfiguration path. It cannot intercept or replace a provider's built-in first-install UI.

## Claude Code: run the full conversational wizard

### 1. Inventory without changing anything

Run both commands and summarize the installed scope, enabled state, and marketplace source:

```bash
claude plugin list --json
claude plugin marketplace list --json
```

Treat a single existing `nexus-os@nexus-os` installation as a reconfiguration. Do not interpret Claude's provider-owned "Open home page" control as installation evidence. Stop and report the recovery returned by setup for multiple scopes, a legacy/manual install, malformed settings, or a marketplace collision; never guess which state to delete.

### 2. Collect exactly two choices

Ask exactly one scope question and require one value:

- `user | project | local`
- `user` is global for this user.
- `project` is shared through repository settings.
- `local` is private to the current project.

Visually mark only the selected scope as selected or installing. If the user chooses a different scope from a single existing install, describe it as a migration to the new scope and include `--move-scope` in the command below.

Ask exactly one hook-mode question and require one value:

- `off | minimal | standard | strict`
- `off` keeps skills and commands only, with no hook automation.
- `minimal` enables only the lightest lifecycle and safety automation.
- `standard` balances quality and security automation.
- `strict` enables the strictest checks and notices.

Hook preferences are individual Claude plugin user config, not shared repository state.

### 3. Preview before execution

Prefer the setup script bundled with the plugin. Substitute the two selected values, adding `--move-scope` only for a scope migration:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/setup.js" --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --dry-run --json
```

If `$CLAUDE_PLUGIN_ROOT` is unavailable, use the published package:

```bash
npx --yes --package nexus-os nexus setup --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --dry-run --json
```

Show exactly one confirmation summary containing the planned action, the single scope, the single hook mode, marketplace operations, and any source-to-destination migration. Ask exactly one yes/no confirmation question. Never invoke the unflagged interactive `nexus setup` over a tool shell.

### 4. Apply explicit choices

After confirmation, run the same path without `--dry-run`. Retain each explicit choice and request JSON:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/setup.js" --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --yes --json
```

Fallback command:

```bash
npx --yes --package nexus-os nexus setup --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --yes --json
```

### 5. Verify before showing welcome

The command must exit with status 0, and the setup result's `scope` and `hooks` must match the selected values. Run independently:

```bash
claude plugin list --json
```

Proceed only when exactly one enabled `nexus-os@nexus-os` entry exists in the chosen scope. If `$CLAUDE_PLUGIN_ROOT` is available, pass the successful setup `action` (`installed`, `updated`, `migrated`, `resumed`, or `already-migrated`) to the built-in renderer:

Before invocation, verify the provider-reported version matches `NEXUS_VERSION_PATTERN` in `scripts/lib/terminal-welcome.js`. Reject anomalous version text without inserting it into shell commands.

```bash
node -e 'const { renderTerminalWelcome } = require(process.env.CLAUDE_PLUGIN_ROOT + "/scripts/lib/terminal-welcome"); process.stdout.write(renderTerminalWelcome({ action: process.argv[1], version: process.argv[2], color: process.stdout.isTTY }));' "<action>" "<installed-version>"
```

Render the welcome display only once. Never render it on failure, preview, cancellation, scope or hook mismatch, or unverified states; report errors and recovery steps instead. Remind the user to run `/reload-plugins` or restart Claude Code after verification succeeds.

## Codex: use native plugin lifecycle

Inspect with `codex plugin marketplace list --json` and `codex plugin list --available --json`. Codex native plugin commands do not provide Claude-style `user | project | local` selectors. Do not ask for Claude scopes or hook modes. Codex native plugins support provider-specific hooks with explicit user trust in `/hooks`. Let Codex display that trust decision; do not claim Claude's four profiles map onto Codex.

If the marketplace is missing, add it; otherwise refresh snapshots:

```bash
codex plugin marketplace add nexus-os/nexus-os
codex plugin marketplace upgrade nexus-os --json
```

Confirm once, then install or idempotently refresh the installed cache, and verify:

```bash
codex plugin add nexus-os@nexus-os --json
codex plugin list --json
```

Proceed only if JSON reports the plugin is installed and provides an `installedPath`, then show the welcome from the verified bundle.

Use only the exact absolute `installedPath` returned in Codex JSON, rejecting control characters. Validate the version against `NEXUS_VERSION_PATTERN`. Invoke `node` directly with an argument array:

```text
["<installedPath>/scripts/welcome.js", "--action", "configured", "--version", "<installed-version>"]
```

If the harness cannot supply an executable and argument array separately, skip the welcome display. Never construct a shell command from Codex JSON values.

Do not claim that Claude's `off | minimal | standard | strict` profiles apply to Codex.

## Kimi: project surface

State the capability summary before confirmation: install target is `./.kimi-code`, lifecycle hooks are `hooks=unsupported`. Do not ask for Claude scopes or hook modes. Preview first:

```bash
npx --yes --package nexus-os nexus install --profile core --target kimi --dry-run
```

Confirm once for this project destination, then apply the identical command without `--dry-run`. Verification command:

```bash
npx --yes --package nexus-os nexus doctor --target kimi
```

Only run the welcome after doctor succeeds and confirms instructions and skills remain inside `./.kimi-code`:

```bash
npx --yes --package nexus-os nexus welcome --action configured
```

Do not claim that Kimi has installed or configured lifecycle hooks.
