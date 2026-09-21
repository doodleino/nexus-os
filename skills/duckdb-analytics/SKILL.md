---
name: duckdb-analytics
description: Leverage embedded columnar SQL analytics, fast Parquet and Arrow processing, and local data engineering using DuckDB.
---

# DuckDB Analytics

This skill provides patterns and best practices for high-speed in-process analytical querying, parquet data manipulation, and local OLAP processing with DuckDB.

## Why DuckDB

- **In-Process & Zero Infrastructure**: Runs embedded inside Python, Node.js, Rust, or CLI with zero external server dependencies.
- **Columnar & Vectorized**: Blazing fast analytical aggregations over millions of rows on commodity laptops.
- **Direct Parquet & S3 Support**: Query remote or local Parquet, CSV, and JSON files directly without loading them into an intermediate database.

## Key Usage Patterns

### 1. Direct Parquet Querying
```sql
SELECT
  customer_id,
  count(*) AS total_orders,
  sum(amount) AS total_spent
FROM 'data/orders/*.parquet'
WHERE order_date >= '2026-01-01'
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 100;
```

### 2. Zero-Copy Arrow Integration
- Pass Apache Arrow tables between DuckDB and machine learning pipelines without serialization overhead.

### 3. Memory & Thread Tuning
- Set `threads = auto` and bound `max_memory` to prevent runaway memory consumption on large aggregations.
