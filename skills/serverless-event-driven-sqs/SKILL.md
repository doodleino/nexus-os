---
name: serverless-event-driven-sqs
description: AWS Lambda, SQS dead-letter queues, EventBridge routing, and idempotent message consumers.
metadata:
  origin: NEXUS-OS
---

# Serverless Event-Driven Architecture (SQS & Lambda)

Use this skill when building asynchronous message processing pipelines with backpressure handling and dead-letter queues (DLQ).

## Idempotent Consumer Pattern

Store processed message IDs in a DynamoDB table with a 24-hour TTL before executing business mutations.
