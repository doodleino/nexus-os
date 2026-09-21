---
name: grpc-protobuf-microservices
description: High-throughput inter-service RPC communication, Protobuf schema versioning, and streaming gRPC clients.
metadata:
  origin: NEXUS-OS
---

# gRPC & Protocol Buffers Microservices

Use this skill to engineer high-throughput, low-latency microservices communication using gRPC and HTTP/2 multiplexing.

## Protobuf Schema Invariant

Never modify existing field tag numbers (`1`, `2`, `3`). When deprecating a field, mark it `reserved` to prevent binary deserialization corruption across versions.
