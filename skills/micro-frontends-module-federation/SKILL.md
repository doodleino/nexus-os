---
name: micro-frontends-module-federation
description: Distributed frontend architectures using Vite Module Federation, shared runtime dependencies, and isolated deployments.
metadata:
  origin: NEXUS-OS
---

# Micro-Frontends & Module Federation

Use this skill when splitting enterprise web applications across independent teams with separate deployment pipelines.

## Vite Module Federation Config

```typescript
// vite.config.ts
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    federation({
      name: 'remote_billing',
      filename: 'remoteEntry.js',
      exposes: {
        './BillingDashboard': './src/components/BillingDashboard.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
```
