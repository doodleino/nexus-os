---
name: pnpm-monorepo-ops
description: Structure, build, and optimize large-scale TypeScript and full-stack monorepos using pnpm workspaces and Turborepo.
---

# pnpm Monorepo Operations

This skill provides guidelines and operational workflows for managing enterprise JavaScript and TypeScript monorepos with `pnpm workspaces` and `turborepo`.

## Core Configuration

1. **`pnpm-workspace.yaml`**:
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
     - 'tooling/*'
   ```
2. **Internal Dependency Protocols**:
   Use `workspace:*` or `workspace:^` for internal packages to guarantee local symlinking during development.
3. **Strict Hoisting**:
   Use pnpm's content-addressable storage and isolated `node_modules` structure to prevent phantom dependencies.

## Turborepo Caching Discipline

- Define clear `inputs` and `outputs` in `turbo.json` so unaffected packages are served directly from build cache.
- Ensure tasks like `build`, `test`, `lint`, and `typecheck` declare their exact package topological dependencies (`^build`).
- Isolate environment variables that affect build artifacts using the `globalEnv` and `env` arrays in `turbo.json`.
