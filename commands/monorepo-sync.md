---
description: Analyze monorepo dependencies, optimize Turborepo pipeline caches, and detect circular imports.
agent: architect
subtask: true
---

# Monorepo Synchronization & Optimization Command

Analyze workspace dependency graphs, optimize build pipeline caching (Turborepo, Nx, pnpm workspaces), detect circular dependency cycles, and scope task execution to changed packages.

## Usage

`/monorepo-sync [--filter package-name] [--since git-ref] [--graph] [--prune] [--verify-cache]`

- `--filter` (optional): Scope analysis or pipeline execution to a specific package and its dependents (`...^package`).
- `--since`: Git commit or branch ref to calculate changed workspace packages (defaults to `main` or `origin/main`).
- `--graph`: Emit visual or Mermaid-compatible dependency DAG of the workspace packages.
- `--prune`: Generate pruned workspace slice for optimized container builds (`turbo prune`).
- `--verify-cache`: Check remote and local computation cache hit rates across pipeline tasks.

## When to Use

- When adding new shared libraries or packages to a monorepo workspace.
- When CI/CD build times grow excessively due to cache misses or improper task dependencies.
- When reorganizing code and preventing circular dependencies between internal packages.
- Guided by monorepo optimization patterns in `skills/turborepo-monorepo-optimization/`.

## Execution Workflow

1. **Workspace Graph Parsing**:
   - Parse package manifests (`package.json`, `Cargo.toml`, `go.work`) across all workspace directories.
   - Construct directed acyclic graph (DAG) of internal package dependencies.

2. **Cycle & Boundary Detection**:
   - Run Tarjan's strongly connected components algorithm to identify circular dependencies between packages.
   - Enforce architectural boundaries (e.g., UI packages must not import server backend packages directly).

3. **Pipeline Configuration Audit**:
   - Validate pipeline configuration (`turbo.json` or `nx.json`).
   - Confirm outputs, inputs, and environment variables are accurately declared to prevent stale cache hits.
   - Ensure cache keys incorporate all files that influence compilation.

4. **Change Impact Scoping**:
   - Compute the exact set of impacted packages based on git diff against baseline ref.
   - Produce minimal build/test execution command targeting only affected workspace packages.

## Review Checklist

- [ ] Workspace DAG constructed with zero circular dependency cycles.
- [ ] Pipeline cache outputs and inputs strictly declared without false cache hits.
- [ ] Internal workspace dependency version ranges consistent across packages.
- [ ] Container build pruning tested and verified.
- [ ] Task execution properly scoped to changed packages.

## Output Contract

Return a structured markdown report:
- **Workspace Inventory**: Total packages, apps, shared libraries, and build graph depth.
- **Dependency Health**: Detected circular cycles, mismatched version specifiers, or boundary violations.
- **Cache Optimization**: Recommended pipeline configuration tweaks for faster CI velocity.
- **Handoff**: Delegated to `architect` for structural refactoring.
