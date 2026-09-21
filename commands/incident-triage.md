---
description: Ingest error logs, trace distributed spans, isolate root cause commits, and draft postmortems.
agent: silent-failure-hunter
subtask: true
---

# Production Incident Triage Command

Ingest unhandled exception stack traces, correlate distributed traces across microservices, isolate recent commit regressions via `git log` and `git blame`, and generate actionable mitigation plans and blameless postmortems.

## Usage

`/incident-triage [log-or-trace-file] [--service name] [--window 1h|24h] [--trace-id id] [--postmortem]`

- `log-or-trace-file` (optional): Path to raw error log, JSON log file, or Sentry issue payload.
- `--service`: Target microservice or application component name.
- `--window`: Time window to analyze for recent deploys or commits (defaults to `24h`).
- `--trace-id`: Specific OpenTelemetry / Jaeger trace ID to inspect across distributed spans.
- `--postmortem`: Automatically generate a structured blameless postmortem document.

## When to Use

- During active production incidents (P1/P2) requiring rapid root-cause diagnosis and mitigation.
- Following automated alert fires (error rate spikes, elevated p99 latency, crashing worker pools).
- When investigating flaky or intermittent bugs reported in production logs.
- Guided by incident remediation workflows in `skills/production-audit/`.

## Execution Workflow

1. **Stack Trace & Error Ingestion**:
   - Parse error messages, exception types, and call stack frames across languages (Node, Python, Go, Rust, Java).
   - De-obfuscate minified stack traces using sourcemaps if available.

2. **Distributed Trace Correlation**:
   - Trace parent-child span execution paths across service boundaries.
   - Pinpoint the exact service and span where latency ballooned or where error status code originated.

3. **Codebase & Commit Attribution**:
   - Map stack trace files and line numbers directly to repository source code.
   - Run `git log` and `git blame` over the relevant line ranges within the incident time window to identify the exact introducing commit and author context.

4. **Mitigation & Rollback Strategy**:
   - Formulate immediate mitigation options:
     - Revert specific commit (`git revert <hash>`).
     - Toggle feature flag or configuration setting.
     - Deploy emergency hotfix patch with minimal blast radius.

5. **Blameless Postmortem Generation**:
   - Construct incident timeline: Detection, Diagnosis, Mitigation, Recovery.
   - Document root cause without attributing individual blame.
   - Detail preventative action items (new test coverage, alert threshold tuning, architectural guardrails).

## Review Checklist

- [ ] Complete exception stack trace ingested and mapped to source files.
- [ ] Root cause mechanism identified with supporting code evidence.
- [ ] Immediate mitigation verified to halt ongoing customer impact.
- [ ] Minimal regression test authored replicating the failure condition.
- [ ] Postmortem document compiled with preventative action items.

## Output Contract

Return a structured markdown report:
- **Incident Overview**: Severity, impacted services, duration, and root cause summary.
- **Root Cause Analysis**: Offending code snippet, introducing commit hash, and trigger condition.
- **Immediate Mitigation**: Concrete shell commands for rollback or hotfix application.
- **Action Items**: Preventative measures (unit test, observability alert, architectural fix).
- **Handoff**: Delegated to `silent-failure-hunter` for automated regression test generation.
