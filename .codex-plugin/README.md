# .codex-plugin - Codex Native Plugin for NEXUS-OS

This directory contains the **Codex plugin manifest** for NEXUS-OS.

## Structure

```
.codex-plugin/
└── plugin.json   - Codex plugin manifest (name, version, skills ref, MCP ref)
.mcp.json         - MCP server configurations at plugin root (NOT inside .codex-plugin/)
hooks/codex-hooks.json - Codex-compatible lifecycle hook projection
```

## What This Provides

- **292 skills** from `./skills/` - reusable workflows for TDD, security,
  code review, architecture, and more
- **1 default MCP server** - Chrome DevTools
- **Codex lifecycle hooks** - synchronous command hooks on supported events,
  with explicit review and trust in `/hooks`

## Installation

Codex 0.146.0 and newer use `plugin add`, not `plugin install`. Add NEXUS-OS's
repository marketplace, install the native plugin, and verify the registration:

```bash
codex plugin marketplace add nexus-os/nexus-os
codex plugin add nexus-os@nexus-os
codex plugin list --json
```

Both add commands are safe to run again. A repeated marketplace add reports
`alreadyAdded: true`, and a repeated plugin add keeps the same enabled plugin
registration. To fetch a newer marketplace snapshot before applying a new
release, run:

```bash
codex plugin marketplace upgrade nexus-os
codex plugin add nexus-os@nexus-os
```

For local development, the same native journey accepts a checkout path:

```bash
codex plugin marketplace add /absolute/path/to/nexus-os
codex plugin add nexus-os@nexus-os
```

NEXUS-OS's marketplace entry points at the repository root. Codex copies the selected
plugin source into its cache, so the root source keeps `skills/`, `.mcp.json`,
`hooks/`, hook scripts, and presentation assets together. Parent-relative paths
from a thin plugin directory would escape that cache and produce an installed
registration with missing runtime content.

Restart Codex after installation. You can also open `/plugins` in Codex CLI to
inspect, enable, disable, or remove the plugin. The native Codex plugin does not
use Claude's `user`, `project`, or `local` install scopes: its enabled state is
stored once in the active `CODEX_HOME` (normally `~/.codex`) and applies to
Codex sessions using that home.

## Hooks and reconfiguration

The Codex manifest uses the documented `hooks` field to bundle
`./hooks/codex-hooks.json`. This provider-specific projection keeps the
synchronous `SessionStart` bootstrap verified against Codex 0.146. Start a new Codex session, open `/hooks`,
then review and trust the NEXUS-OS hook definition before enabling it.
Use `/plugins` for plugin enablement and `/hooks` for hook trust;
these are separate controls.

Once the cached skills are available, invoke `$configure-nexus` inside Codex for
guided configuration. Installing the plugin again is idempotent and does
not create a second scope or duplicate hook registration.

## Native plugin versus legacy managed sync

The commands above are the native Codex plugin path. Legacy managed sync is retained only for backwards compatibility via `bash scripts/sync-nexus-to-codex.sh`.

After install, `codex plugin list` is only a registration check. From a NEXUS-OS
checkout, run the cache check to verify that the installed manifest can resolve
its referenced skills, MCP config, and assets:

```bash
node scripts/codex/check-plugin-cache.js
```

The installed plugin registers under the slug `nexus-os`.

## MCP Servers Included

| Server | Purpose |
|---|---|
| `chrome-devtools` | Interactive browser debugging via Chrome DevTools (CDP sessions, performance traces, console/network inspection) |

## Notes

- The `skills/` directory at the repo root is the source of truth for the Codex
  plugin package; do not duplicate skill content inside `.codex-plugin/`.
- MCP server credentials are inherited from the launching environment (env vars)
- This manifest does **not** override `~/.codex/config.toml` settings
