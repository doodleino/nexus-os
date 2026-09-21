---
name: timescale-time-series-db
description: High-volume time-series storage, hypertables, continuous aggregates, and compression with TimescaleDB.
metadata:
  origin: NEXUS-OS
---

# TimescaleDB & Time-Series Optimization

Use this skill to ingest, compress, and query high-velocity metrics, financial ticks, and IoT sensor streams.

## Hypertable Creation

```sql
CREATE TABLE metric_readings (
    time TIMESTAMPTZ NOT NULL,
    device_id INT NOT NULL,
    temperature DOUBLE PRECISION NULL
);

SELECT create_hypertable('metric_readings', 'time');
```
