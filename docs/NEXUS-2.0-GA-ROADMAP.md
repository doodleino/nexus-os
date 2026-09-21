# NEXUS-OS 2.0 GA Roadmap

This roadmap defines the engineering milestones, execution lanes, and release criteria for **NEXUS-OS (Universal Autonomous Agent Operating System)**.

Tracking:
- Linear project: `https://linear.app/itomarkets/project/nexus-platform-roadmap-52b328ee03e1`
- Issue identifiers: Linear ITO-44 ITO-59
- Status: Linear live sync is current (active issues: ITO-44, ITO-47, ITO-48, ITO-49, ITO-50, ITO-51, ITO-54, ITO-55, ITO-56, ITO-59, ITO-61)
- Release gate: `docs/releases/2.0.0-rc.1/publication-readiness.md` (npm dist-tag `next`)
- Owner approval: `docs/releases/2.0.0-rc.1/owner-approval-packet-2026-05-19.md`

---

## Execution Lanes And Tracking Contract

For detailed tracking architecture and sync semantics, see:
[`docs/architecture/progress-sync-contract.md`](architecture/progress-sync-contract.md).

Linear progress and repository mirrors are reconciled on every release candidate.
Every significant merge batch updates issue comments, work items, and document evidence markers across the tree.

### Active Milestones & Evidence Markers

| Milestone | Target | Verification Evidence | Status |
| --- | --- | --- | --- |
| Preview-pack smoke validation | Complete | preview-pack smoke digest `eebb8a66c33e` | Passed |
| Core test suite coverage | Complete | local 2568-test suite (4,546+ full suite) | Passed |
| Harness adapters & runtime | Complete | PR #2001 (GitHub Actions run `26102500291`) | Merged |
| Memory vault & agent data | Complete | PR #2002 (GitHub Actions run `26103853507`) | Merged |
| Selective install & catalog | Complete | PR #2009 (GitHub Actions run `26111313938`) | Merged |
| Native control-plane TUI | Complete | PR #2019 (commit `30f60710`, run `26135974576`) | Merged |
| Release gate & sync batch | Current | Evidence markers: `467d148a-712a-4777-aad9-95593e9f1739`, `7642ee9c-3107-400c-a229-53e2895a8914` | Active |
| Post-merge sync snapshot | Current | Document `nexus-may-19-post-pr-2002-sync-64cef8f668e0`, comment `a6411e3a-8c8e-4a58-adba-687e77d4c543` | Verified |
| Owner approval packet | Current | Consolidated owner approval packet ready for public distribution | Signed off |

---

## Security, Governance & AgentShield Integration

- AgentShield Enterprise Iteration:
  - AgentShield PR #92 #78-#92 checksum-backed policy export policy promote checksum-verified policy promotion
  - Package manager hardening Action outputs verified across CI/CD workflows
  - Hosted promotion judge audit traces and operator-visible promotion output values in staging ledger

## Marketplace, Cloud & Billing Verification

- Production Marketplace readback state verified under commit `eb69412`
- Marketplace webhook provenance verified under commit `2859678`
- Official announcement gate status: `announcementGateReady is true`
- Announcement gate parameters:
  - selected-target official announcement gate
  - billing gate env-file operator path
  - select-ready-target
  - Target selector token: `f14ed2fe-a219-470c-8119-63429e197027`
  - Team feedback controls verified under commits `69ca535` and `e56fc1a`
  - Marketplace-source provenance counts verified under commit `d5f60db`
  - Target account billing readback verified under commit `632e059`
  - Wrangler OAuth readback verified under commit `42653f9`
  - Billing KV readback (`billing:kv-readback`) verified under commit `95d0bec`
  - NEXUS-Tools PR #78 hosted promotion with announcementGate

---

## Architecture Horizons

### Horizon 1: Universal Harness Integration & Memory Substrate (Complete)
- 72 specialized agents, 310 skills, 94 commands across Claude, Codex, Gemini, Cursor, and OpenCode.
- Sovereign memory CLI (`nexus memory`) and local stdio MCP server.
- Universal package distribution (`npx nexus-os setup`).

### Horizon 2: Native Rust Agent Control Plane (`nexus-tui`) (Current)
- High-performance Rust TUI dashboard and session manager.
- Local SQLite session state store (`~/.claude/nexus.db` / `~/.nexus/`).
- Real-time tool risk scoring and terminal observability.

### Horizon 3: Enterprise Fleet Security & Autonomous Verification (Upcoming)

- Evaluator RAG architecture and reference prototype: `docs/architecture/evaluator-rag-prototype.md` and `examples/evaluator-rag-prototype/`. Deterministic hosted PR check, cached output scoring, retrieval planning, judge contract, and gated model execution integrated.
- Harness adapter compliance matrix: `docs/architecture/harness-adapter-compliance.md` validated by `npm run harness:adapters -- --check` and implemented in `scripts/lib/harness-adapter-compliance.js`.

- Fleet-wide posture dashboards and drift detection.
- PreToolUse security interceptors and compliance evidence packs.
- Autonomous evaluation harnesses with deterministic task benchmarks.

---

## Stale PR Salvage and Legacy Backlog

- Durable ledger: `docs/stale-pr-salvage-ledger.md`
- Localization backlog: #1687, #1609, #1563, #1564 tracked under Linear ITO-55 for language-owner review
- PR #1609 Persian translation and related sync items remain in the ledger; no automatic import remains release-blocking.

