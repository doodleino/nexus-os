---
name: turborepo-monorepo-optimization
description: Monorepo management with Turborepo, remote computation caching, dependency pruning, and pipeline orchestration.
metadata:
  origin: NEXUS-OS
---

# Turborepo Monorepo Optimization

Use this skill to accelerate build, test, and lint pipelines across multi-package JavaScript/TypeScript repositories.

## Pipeline Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "tests/**/*.ts"]
    }
  }
}
```
