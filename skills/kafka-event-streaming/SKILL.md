---
name: kafka-event-streaming
description: Design resilient event-driven architectures, idempotent consumers, and fault-tolerant topic partitioning with Apache Kafka.
---

# Kafka Event Streaming

This skill provides patterns for building high-throughput, fault-tolerant event-driven systems using Apache Kafka.

## Core Architectural Patterns

1. **Partitioning & Ordering**:
   - Messages with the same partition key are guaranteed strict in-order delivery.
   - Choose partition keys carefully to prevent hot-partition bottlenecks.
2. **Idempotent Consumers**:
   - Network retransmissions and rebalances lead to at-least-once delivery.
   - Implement deduplication using message IDs stored in a fast transactional store (Redis/Postgres).
3. **Dead Letter Queues (DLQ)**:
   - Poison-pill messages that fail deserialization or business processing must be routed to a dead-letter topic to unblock partition consumption.

## Reliability Rules

- Configure `acks=all` and `min.insync.replicas=2` for financial or mission-critical write paths.
- Enforce schema evolution standards using Avro or Protobuf with a Schema Registry (backward/forward compatibility).
- Keep commit offsets manual or strictly controlled to avoid acknowledging unprocessed messages.
