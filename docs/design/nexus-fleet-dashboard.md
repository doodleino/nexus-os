# NEXUS-OS: Multi-Repo Agent Security Posture Dashboard

> Status: Architecture design for NEXUS-OS Fleet Posture Dashboard.
> Companion to docs/NEXUS-SECURITY-ROADMAP.md.

## 1. Title, Thesis, and Wedge

NEXUS-OS Fleet Dashboard is a multi-repo "Sentry for agent security" surface built on top of the NEXUS local security primitives. The thesis: continuous and fleet primitives that make an enterprise control plane valuable exist as local CLI building blocks (evidence packs with `bundleDigest` integrity, `operatorReadback`/`reviewItems` promotion routing, drift detection, NDJSON runtime allow/block logging, baseline diffing, and policy promotion gates). Hosting and federating these primitives provides multi-repo and multi-team visibility into agent posture and runtime telemetry over time.

The wedge: SCA tools are scan-only and have no concept of agent-runtime semantics (no PreToolUse deny decisions, no MCP/hook/agent injection model, no drift-over-time on agent config). Sentry has time-series and alerting but zero agent security semantics; it does not know what an autonomous tool permission bypass or an unreviewed MCP server is. The NEXUS Fleet Dashboard charts score trends, drift history, blocked-command rates, and injection-attempt rates across a fleet of repositories, anchored on a comprehensive security rule engine across secrets, permissions, hooks, MCP, and agents.

## 2. Scope: Free Local-First vs Enterprise Fleet

The local-first core remains 100% open, sovereign, and free under MIT:
- `nexus scan` and all security rules, across terminal, json, markdown, and sarif formats.
- Deep agentic security analysis and auto-remediation.
- Evidence pack generation, inspection, verification, and fleet summary.
- Baseline calculation, diffing, and CI regression gating.
- Runtime interceptors, PreToolUse guardrails, and audit logging.
- Policy evaluation across standard, team, and regulated profiles.
- Continuous workspace drift monitoring.
- Native GitHub Action and CI integration.

Fleet Governance Surface:
- Persisted historical trends across repositories and organizations.
- Centralized posture rollup, fleet operator readbacks, and organizational score trends.
- Authenticated ingestion endpoints for CI scan results and runtime audit logs.
- Visual control center for posture, drift timeline, and runtime intervention rates.
- Policy promotion approval gates across teams.

## 3. Architecture

The architecture connects local-first CLI and CI producers through a stateless ingestion gateway into time-series and relational stores, surfacing insights via the NEXUS Control Center:

```text
  PRODUCERS (local-first, clean, redacted)
  +-----------------------+   +------------------------+   +-------------------------+
  | CI Scanner            |   | Workspace Watcher      |   | PreToolUse Runtime Gate |
  | (scan, evidence pack, |   | (drift detection,      |   | (interceptor ->         |
  |  SARIF, baseline)     |   |  audit trail)          |   |  runtime event stream)  |
  +-----------+-----------+   +-----------+------------+   +-----------+-------------+
              |                            |                            |
              v                            v                            v
  +-----------------------------------------------------------------------------------+
  | INGESTION GATEWAY (stateless, authenticated)                                       |
  |  - Org/repo token authentication                                                  |
  |  - Strict schema validation and bundle digest verification                        |
  |  - Redaction verification (rejects unredacted raw credentials)                    |
  +-----------------------------------+-----------------------------------------------+
                                      |
                 +--------------------+--------------------+
                 v                                         v
  +-----------------------------+              +-------------------------------+
  | RELATIONAL REPOSITORY       |              | TIME-SERIES TELEMETRY         |
  |  Scans, baselines, findings,|              |  Score trends, drift events,  |
  |  review items, policies     |              |  blocked tool calls, alerts   |
  +--------------+--------------+              +---------------+---------------+
                 |                                             |
                 +----------------------+----------------------+
                                        v
  +-----------------------------------------------------------------------------------+
  | NEXUS CONTROL CENTER & FLEET API                                                  |
  |  Multi-tenant isolation, RBAC, posture dashboard, assignable review items         |
  +-----------------------------------------------------------------------------------+
```

## 4. Grounding and Roadmap Alignment

This design aligns directly with the sovereign, local-first principles of **NEXUS-OS**:
1. All local inspection, scanning, and remediation remain free, open, and local-first.
2. The fleet dashboard adds aggregation, historical timelines, and collaborative review without altering local sovereignty.
3. Telemetry strictly adheres to data minimization: no raw credentials, private tokens, or sensitive user inputs are ever transmitted.
