---
name: cloudflare-workers-edge
description: Serverless edge execution, KV storage, D1 SQL, Durable Objects, and WebSocket hibernation on Cloudflare Workers.
metadata:
  origin: NEXUS-OS
---

# Cloudflare Workers & Edge Infrastructure

Use this skill to deploy globally distributed serverless APIs, WebSocket relays, and edge databases using Cloudflare Workers.

## Edge Worker with D1 Database

```typescript
export interface Env {
  DB: D1Database;
  RATE_LIMITER: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { results } = await env.DB.prepare(
      "SELECT id, title, created_at FROM articles WHERE published = 1 LIMIT 20"
    ).all();

    return Response.json({ success: true, data: results });
  }
};
```
