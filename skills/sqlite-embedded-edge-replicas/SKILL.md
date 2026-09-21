---
name: sqlite-embedded-edge-replicas
description: Local-first and embedded edge databases with SQLite, LibSQL, Turso replication, and offline syncing.
metadata:
  origin: NEXUS-OS
---

# SQLite Embedded Edge Replicas

Use this skill when developing offline-first local applications or ultra-low-latency edge APIs using SQLite and LibSQL.

## WAL Mode Invariant

Always execute `PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;` during connection initialization to enable concurrent reads without blocking writes.
