---
description: Design zero-downtime database migrations with expand-and-contract and safe rollback plans.
agent: database-reviewer
subtask: true
---

# Database Migration Planning Command

Design backwards-compatible, zero-downtime database schema migrations using the expand-and-contract pattern, verify table lock implications, and generate automated rollback DDL.

## Usage

`/migration-plan [schema-file-or-diff] [--orm drizzle|prisma|typeorm|sql] [--engine postgres|mysql] [--verify-rollback]`

- `schema-file-or-diff` (optional): Path to target schema file (e.g., `schema.ts`), SQL migration script, or branch git diff.
- `--orm`: ORM or migration tool (defaults to `drizzle`). Supports `prisma`, `typeorm`, or raw `sql`.
- `--engine`: Target database engine (defaults to `postgres`).
- `--verify-rollback`: Generate and execute down-migration dry-run asserting schema symmetry.

## When to Use

- When renaming columns, splitting tables, changing column types, or adding non-null constraints to high-traffic production databases.
- When generating schema migrations with Drizzle, Prisma, or Flyway for multi-tenant applications.
- When preventing long table-level exclusive locks (`ACCESS EXCLUSIVE`) that block application reads and writes.
- Guided by schema evolution practices in `skills/drizzle-orm-patterns/`.

## Execution Workflow

1. **Schema Diff & Impact Analysis**:
   - Compute exact structural delta between current database state and target schema.
   - Classify changes by risk tier:
     - **Low Risk**: Adding nullable column, adding new unreferenced table, adding index concurrently.
     - **High Risk**: Renaming column, changing data type, adding `NOT NULL` without default, dropping column.

2. **Expand-and-Contract Architecture**:
   - For high-risk modifications, generate a multi-phase deployment plan:
     - **Phase 1 (Expand)**: Add new column/table in parallel with existing structure.
     - **Phase 2 (Dual Write)**: Application code writes to both old and new columns; backfill historical data in bounded batches.
     - **Phase 3 (Read Switch)**: Application code reads from new column.
     - **Phase 4 (Contract)**: Drop old column and remove dual-write application logic.

3. **Locking & Concurrency Guardrails**:
   - Set lock timeouts (`SET lock_timeout = '2s';`) to prevent cascading connection queuing.
   - Use `CREATE INDEX CONCURRENTLY` and `VALIDATE CONSTRAINT` in separate transactions.

4. **Rollback DDL Generation**:
   - Provide exact reverse DDL statements for every forward change.
   - Ensure rollback statements are safe to run even if application code has already begun writing data.

## Review Checklist

- [ ] All high-risk changes decomposed into zero-downtime expand-and-contract phases.
- [ ] No statement locks table for longer than acceptable threshold (<2s).
- [ ] Non-null columns added with server-side defaults or separate validate constraint steps.
- [ ] Historical backfill scripts include transaction batching and throttling.
- [ ] Reversible rollback script authored and verified.

## Output Contract

Return a structured markdown report:
- **Migration Blueprint**: Forward SQL statements, phase breakdown, and application code dependencies.
- **Rollback Script**: Complete down-migration DDL for emergency recovery.
- **Locking Analysis**: Acquired table locks per statement and recommended deployment window.
- **Handoff**: Delegated to `database-reviewer` for schema approval.
