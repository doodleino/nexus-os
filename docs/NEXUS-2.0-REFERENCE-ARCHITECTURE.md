# NEXUS-OS 2.0 Reference Architecture

This reference architecture document describes the structural topology, component boundaries, and security model of **NEXUS-OS (Universal Autonomous Agent OS)**.

## Architectural Layers

1. **Autonomous Harness Adapters & Native Plugins**:
   - Claude Code (`.claude-plugin/`, hooks, slash commands).
   - OpenAI Codex (`.codex-plugin/`, marketplace, native hooks).
   - Google Gemini (`.gemini/GEMINI.md`, agent adaptors).
   - Cursor IDE (`.cursor/`, rules, subagents).
   - OpenCode (`.opencode/`, plugins, hooks).

2. **Master Control CLI & Runtime Dispatcher**:
   - Unified CLI entrypoint at `scripts/nexus.js` (aliased as `nexus` and `nexus-os`).
   - Diagnostic and repair lifecycle: `doctor`, `repair`, `status`, `list-installed`.
   - Guided multi-harness installer and reconciler (`scripts/install-guided.js`).

3. **Autonomous Memory Vault & Context Graph**:
   - File-first Markdown persistence under `.nexus/memory/` and `~/.nexus/memory/`.
   - High-speed relational context graph in SQLite.
   - Standard stdio MCP protocol bridge (`scripts/memory-mcp.mjs`).

4. **Security & Governance GateGuard**:
   - PreToolUse interceptors with real-time fact-force validation and risk scoring.
   - Protected file access filters, console log guards, and auto-compaction suggestions.
   - Supply-chain IOC auditing and provenance attestation.

5. **Rust High-Performance TUI & Session Daemon (`nexus-tui`)**:
   - Tokio-powered async session management with SQLite state tracking.
   - Ratatui terminal dashboard for real-time observability, telemetry, and conflict resolution.

Keep the release/name/plugin publication checklist current and verified across all supported platform harnesses.
