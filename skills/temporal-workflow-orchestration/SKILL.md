---
name: temporal-workflow-orchestration
description: Architect and implement durable, fault-tolerant distributed background workflows, retry policies, and stateful activities with Temporal.
---

# Temporal Workflow Orchestration

This skill provides architectural guidance for designing durable, stateful event-driven workflows using Temporal in TypeScript, Go, or Python.

## Core Concepts

1. **Workflows**: Deterministic functions defining the sequence of activities and business logic.
2. **Activities**: Non-deterministic operations (network calls, database writes, external APIs) executed by worker pools.
3. **Signals & Queries**: Mechanisms for injecting external events and querying in-flight workflow state.

## Determinism Rules for Workflows

Workflows are replayed from event history; they MUST be deterministic:
- NEVER use random numbers (`Math.random()`), system clocks (`Date.now()`), or direct I/O inside workflow code.
- ALWAYS use Temporal-provided abstractions (`workflow.now()`, `workflow.sleep()`).
- All side effects must reside inside Activities.

## Retry & Error Policies

- Configure explicit exponential backoff with non-retryable error types for known business failures.
- Implement heartbeats for long-running activities to detect worker crashes promptly.
- Use Saga patterns and compensations for rolling back multi-step distributed operations.
