---
name: apache-arrow-parquet-pipelines
description: In-memory columnar data processing, Parquet file IO, and Polars fast DataFrame analytics.
metadata:
  origin: NEXUS-OS
---

# Apache Arrow & Parquet Data Pipelines

Use this skill to process gigabyte-to-terabyte analytical workloads using Apache Arrow memory formats and Apache Parquet columnar files in Python or Rust.

## Polars Lazy Evaluation

Always prefer `pl.scan_parquet()` with lazy execution over eager reading to allow predicate pushdown and chunk-level filtering.
