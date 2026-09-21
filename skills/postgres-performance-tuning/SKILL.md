---
name: postgres-performance-tuning
description: Diagnose slow SQL queries, optimize PostgreSQL index strategies, configure connection pooling, and tune engine parameters.
---

# PostgreSQL Performance Tuning

This skill provides deterministic diagnosis and optimization workflows for maximizing PostgreSQL query speed, index efficiency, and resource utilization.

## Query Optimization Workflow

1. **`EXPLAIN (ANALYZE, BUFFERS, COSTS)`**:
   - Inspect query execution plans for sequential scans on large tables, costly nested loops, or excessive buffer reads.
2. **Index Strategies**:
   - **B-Tree**: Default for equality and range queries on scalar columns.
   - **GIN**: Essential for full-text search, array containment (`@>`), and JSONB querying (`jsonb_path_ops`).
   - **BRIN**: Ideal for massive, naturally ordered append-only tables (time-series, audit logs).
   - **Partial Indexes**: Index only active or unarchived rows (`WHERE status = 'pending'`) to save disk and memory.
3. **Connection Pooling**:
   - PostgreSQL allocates a separate OS process per connection.
   - Always place a transaction-level connection pooler (such as PgBouncer) in front of high-concurrency application servers.
