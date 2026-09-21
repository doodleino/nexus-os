---
name: opentelemetry-tracing
description: Instrument distributed tracing, context propagation, and observable span metrics using the OpenTelemetry standard.
---

# OpenTelemetry Tracing

This skill outlines best practices for implementing vendor-neutral observability, distributed request tracing, and latency monitoring across microservices using OpenTelemetry (OTel).

## Core Concepts

1. **Tracer & Spans**:
   - A trace represents an end-to-end request flow.
   - Spans represent individual units of work with start/end timestamps, attributes, and events.
2. **W3C Trace Context Propagation**:
   - Pass `traceparent` and `tracestate` headers across HTTP and message queue boundaries to connect distributed operations into a single trace graph.
3. **Semantic Conventions**:
   - Follow standard OTel naming conventions (e.g. `http.request.method`, `db.system`, `rpc.service`).

## Implementation Discipline

- **Automatic Instrumentation First**: Use official auto-instrumentation packages for HTTP frameworks, database drivers, and messaging queues.
- **Enrich With Custom Spans**: Wrap critical business workflows in manual spans to capture domain-specific metadata.
- **Redact Sensitive Data**: Filter out authorization tokens, PII, passwords, and sensitive cookies before exporting spans to OTLP collectors.
