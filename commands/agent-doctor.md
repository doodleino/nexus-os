---
description: Diagnose agent environment, verify MCP servers, inspect SQLite memory vaults, and check tool health.
agent: harness-optimizer
subtask: true
---

# Agent Doctor Command

Perform end-to-end diagnostics on the local agent environment, verifying MCP server connectivity, SQLite memory vault integrity, adapter configurations, and token threshold settings.

## Usage

`/agent-doctor [--target all|mcp|memory|harness|tools] [--fix] [--json]`

- `--target`: Subsystem to inspect (defaults to `all`).
  - `mcp`: Verify MCP server configurations, transport sockets, and tool discovery.
  - `memory`: Inspect local SQLite memory database tables, indexes, and embedding status.
  - `harness`: Check active coding harness adapter configs (Claude Code, Cursor, Codex, OpenCode, Gemini).
  - `tools`: Test responsiveness and schema validity of registered agent tools.
- `--fix`: Automatically resolve common non-destructive misconfigurations (stale locks, schema rebuilds, missing dirs).
- `--json`: Output structured machine-readable diagnostic telemetry.

## When to Use

- When agent tool calls fail intermittently or report connection refused errors.
- When persistent memory retrieval (`memory_search`, `memory_read`) returns no results.
- When setting up NEXUS-OS on a new workstation or after upgrading developer harnesses.
- Guided by environment maintenance in `skills/unified-memory/`.

## Execution Workflow

1. **Harness & Adapter Environment Check**:
   - Verify active provider environment variables (`CLAUDE_CONFIG_DIR`, `CURSOR_SETTINGS_DIR`).
   - Validate plugin installation manifests and configuration files (`.claude-plugin/plugin.json`, `.mcp.json`).

2. **MCP Server Health Probes**:
   - Spawn configured MCP servers over stdio and SSE transports.
   - Send `tools/list` ping and verify that expected tools respond within timeout threshold (5s).
   - Check process permissions and isolate failing subprocesses.

3. **SQLite Memory Vault Verification**:
   - Check SQLite database file integrity (`PRAGMA integrity_check;`).
   - Confirm essential tables (`memories`, `entities`, `links`, `schema_migrations`) exist and indexes are intact.
   - Sweep orphaned write locks or dead transaction logs.

4. **Context Window & Token Budget Audit**:
   - Check active context compaction thresholds against configured models.
   - Detect tool response payload bloat that could prematurely exhaust context windows.

## Review Checklist

- [ ] All configured MCP servers connect and emit valid tool lists.
- [ ] SQLite memory database integrity verified without corruption.
- [ ] Adapter configurations valid for all installed coding harnesses.
- [ ] File permissions and socket paths accessible to current user.
- [ ] Stale temporary files and abandoned lock files safely cleaned.

## Output Contract

Return a structured markdown report:
- **Diagnostic Matrix**: Subsystem status table (Subsystem, Status, Latency, Notes).
- **Detected Issues**: Clear breakdown of any failing services or corrupt state with error logs.
- **Remediation Steps**: Automated fixes applied or manual configuration commands needed.
- **Handoff**: Delegated to `harness-optimizer` for performance and configuration tuning.
