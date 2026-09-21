---
name: react-server-components-streaming
description: React 19 RSC streaming patterns, Suspense boundaries, async server components, and progressive hydration.
metadata:
  origin: NEXUS-OS
---

# React Server Components & Streaming

Use this skill to architect modern React 19 / Next.js applications leveraging asynchronous component execution and progressive chunk streaming.

## Core Rules

1. **Keep Client Boundaries at Leaves**: Push `'use client'` to the outermost interactive leaf components. Never wrap layout roots with client directives.
2. **Stream Slow I/O with Suspense**: Wrap independent asynchronous data fetches in isolated `<Suspense fallback={<Skeleton />}>` boundaries to unblock fast First Contentful Paint.
3. **No Waterfalls**: Use `Promise.all()` for independent data dependencies inside server components.

```tsx
import { Suspense } from 'react';

async function SlowAnalyticsPanel() {
  const data = await fetchTelemetryMetrics();
  return <MetricsChart data={data} />;
}

export default async function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">System Status</h1>
      <Suspense fallback={<div className="animate-pulse h-48 bg-slate-800 rounded" />}>
        <SlowAnalyticsPanel />
      </Suspense>
    </main>
  );
}
```
