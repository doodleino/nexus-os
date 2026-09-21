---
description: Inject synthetic network latency, service faults, and process crashes to verify resiliency.
agent: silent-failure-hunter
subtask: true
---

# Chaos Engineering & Fault Injection Command

Run automated resilience experiments by injecting controlled network latency, packet loss, upstream HTTP 500 errors, process crashes, and database connection timeouts to verify graceful degradation and circuit breakers.

## Usage

`/chaos-test [experiment-name] [--target service-or-port] [--fault latency|error|drop|crash] [--duration seconds] [--dry-run]`

- `experiment-name` (optional): Name of preconfigured experiment scenario (e.g., `db-failover`, `auth-timeout`, `downstream-500`).
- `--target`: Target microservice endpoint, port, or Docker container name.
- `--fault`: Type of fault to inject:
  - `latency`: Introduce artificial delays (e.g., 2000ms latency on external API calls).
  - `error`: Force specific HTTP error codes (500 Internal Server Error, 503 Service Unavailable).
  - `drop`: Drop TCP packets simulating network partition.
  - `crash`: Terminate worker process or service abruptly.
- `--duration`: Duration of fault window in seconds (default: `30`).
- `--dry-run`: Validate experiment topology, rollback triggers, and safety conditions without injecting faults.

## When to Use

- When validating circuit breakers, retry policies, exponential backoff, and fallback caches.
- Prior to launching high-traffic services or migrating to distributed microservices.
- When verifying that a downstream dependency outage does not cascade into a complete system blackout.
- Guided by resilience workflows in `skills/chaos-engineering-experiments/`.

## Execution Workflow

1. **Steady-State Baseline Verification**:
   - Establish normal operating baseline: request throughput, p95/p99 latency, and error rate (<0.1%).
   - Verify health check endpoints and active monitoring alerts.

2. **Hypothesis & Safety Guardrails**:
   - Formulate hypothesis (e.g., "When Payment API experiences 3s latency, checkout falls back to queued async processing").
   - Define blast radius limits and emergency stop criteria (e.g., error rate > 5% terminates experiment immediately).

3. **Fault Injection**:
   - Configure proxy or kernel fault injection (Toxiproxy, Chaos Mesh, mock HTTP proxies).
   - Inject specified fault for the defined duration while traffic is flowing.

4. **Resiliency & Recovery Observation**:
   - Verify circuit breaker trips from CLOSED to OPEN state without thread exhaustion.
   - Confirm customer-facing responses return structured fallbacks instead of uncaught exceptions.
   - Measure Mean Time to Recovery (MTTR) once fault is removed.

## Review Checklist

- [ ] Steady-state metrics measured and verified prior to injection.
- [ ] Emergency stop rollback mechanism tested and armed.
- [ ] Application circuit breakers and retry policies observed in action.
- [ ] No cascading connection pool starvation or thread pool lockup detected.
- [ ] Post-experiment recovery confirmed back to steady state.

## Output Contract

Return a structured markdown report:
- **Experiment Results**: Hypothesis validation (Confirmed / Refuted).
- **Metric Telemetry**: p95/p99 latency, error rate before, during, and after fault window.
- **Vulnerabilities Uncovered**: Unhandled timeouts, missing fallback responses, or aggressive retries causing storming.
- **Handoff**: Delegated to `silent-failure-hunter` for resilience defect remediation.
