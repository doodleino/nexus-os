---
name: meilisearch-fulltext-engine
description: Fast typo-tolerant full-text search integration, faceted filtering, and geo-search with Meilisearch.
metadata:
  origin: NEXUS-OS
---

# Meilisearch Full-Text Search

Use this skill when building instantaneous, typo-tolerant search experiences with faceted filtering and ranking rules.

## Search Request Pattern

```typescript
const results = await index.search('query', {
  filter: 'category = "electronics" AND in_stock = true',
  sort: ['price:asc'],
  limit: 20
});
```
