# plugins/nexus - Codex Plugin Artifact

This directory provides a thin plugin discovery point for Codex environments. The primary
`.agents/plugins/marketplace.json` points at the self-contained repository root,
which Codex 0.146.0 accepts and copies with all referenced runtime content.

## Single source of truth

Per the repository single-source-of-truth policy, no skill or MCP content is vendored
here. `.codex-plugin/plugin.json` references the canonical root content with
parent-relative paths:

| Manifest field | Resolves to |
|---|---|
| `skills` | `skills/` at the repo root |
| `mcpServers` | `.mcp.json` at the repo root |
| `interface.composerIcon` / `interface.logo` | `assets/` at the repo root |

The canonical Codex plugin manifest for the repo-root bundle remains
at `.codex-plugin/plugin.json`. Keep `name` and `version` in both manifests in
sync.

## Current Codex plugin-mode status

The native marketplace installs from the repository root. A fresh Codex
cache contains the configure skill, shared skills, MCP configuration,
hooks, scripts, and assets, and an authenticated session loads the
`configure-nexus` skill cleanly.

After install, verify that the runtime loads the referenced skills and assets:

```bash
node scripts/codex/check-plugin-cache.js
```

The check inspects the installed cache under `CODEX_HOME` (or `~/.codex`) and
validates that `.codex-plugin/plugin.json` points at verified files.
