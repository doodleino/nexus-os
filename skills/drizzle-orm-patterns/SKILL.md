---
name: drizzle-orm-patterns
description: Type-safe SQL querying, zero-overhead migrations, relation queries, and schema declaration with Drizzle ORM.
metadata:
  origin: NEXUS-OS
---

# Drizzle ORM Patterns

Use this skill to build type-safe, lightweight database interactions for TypeScript backends using Drizzle ORM.

## Schema Definition

```typescript
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```
