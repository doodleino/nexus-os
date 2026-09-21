---
description: Profile database queries with EXPLAIN ANALYZE, diagnose slow scans, and recommend indexes.
agent: database-reviewer
subtask: true
---

# Database Query Profiling Command

Profile SQL queries, inspect execution plans via `EXPLAIN (ANALYZE, BUFFERS)`, detect sequential scans and lock contention, and generate index and rewrite recommendations.

## Usage

`/db-profile [query-or-file] [--engine postgres|mysql|sqlite] [--buffers] [--format text|json|markdown]`

- `query-or-file` (optional): Raw SQL string, path to a `.sql` file, or query identifier from slow query logs.
- `--engine`: Target database dialect (defaults to `postgres`). Supports `mysql` and `sqlite`.
- `--buffers`: Include buffer hit/miss metrics (`shared hit`, `read`, `written`) for I/O cost isolation.
- `--format`: Report output format (`text`, `json`, or `markdown`).

## When to Use

- When investigating queries exceeding latency budgets (>100ms OLTP).
- When a new feature or ORM query involves complex joins, aggregations, or filters on unindexed columns.
- When verifying query plan stability before shipping schema migrations or new indexes.
- During performance audits guided by `skills/database-query-profiling/`.

## Execution Workflow

1. **Query Plan Extraction**:
   - For PostgreSQL: Execute or simulate `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS, FORMAT JSON) <query>`.
   - For MySQL: Execute `EXPLAIN ANALYZE <query>`.
   - For SQLite: Execute `EXPLAIN QUERY PLAN <query>`.

2. **Cost & Bottleneck Analysis**:
   - Identify sequential scans (`Seq Scan`) on large relations (>10,000 rows).
   - Check filter selectivity (`Filter:` vs `Rows Removed by Filter:`).
   - Detect nested loop joins on unindexed foreign keys where hash or merge joins should occur.
   - Inspect buffer usage: high `read` counts relative to `hit` indicate cold cache or missing indexes.
   - Flag sort spilling to disk (`Sort Method: external merge Disk`).

3. **Index & Schema Optimization**:
   - Propose optimal composite indexes following the Equality, Range, Sort (ESR) rule.
   - Recommend partial indexes for filtered queries with low-cardinality status predicates.
   - Suggest query rewrites (e.g., replacing subqueries with CTEs/window functions, avoiding `SELECT *`).

4. **Verification & Regression Test**:
   - Compare before-and-after query cost, execution time, and buffer reads.
   - Ensure proposed indexes do not penalize write-heavy tables disproportionately.

## Review Checklist

- [ ] Execution plan extracted with timing and buffer statistics.
- [ ] Primary bottleneck identified (Seq Scan, disk sort, nested loop, lock wait).
- [ ] Specific index creation DDL provided with `CONCURRENTLY` flag where supported.
- [ ] Query rewrite provided with side-by-side performance delta.
- [ ] Safe rollout plan detailed (index creation during off-peak, locking implications).

## Output Contract

Return a structured markdown report:
- **Summary**: Query identifier, execution time before/after, and dominant cost node.
- **Root Cause**: Specific operator causing degradation with node metrics.
- **Remediation**: Exact DDL (`CREATE INDEX CONCURRENTLY ...`) or rewritten SQL query.
- **Handoff**: Delegated to `database-reviewer` for schema migration review.
