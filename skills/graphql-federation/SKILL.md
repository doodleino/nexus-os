---
name: graphql-federation
description: Compose distributed microservice subgraphs into a unified, high-performance GraphQL schema using Apollo Federation.
---

# GraphQL Federation

This skill provides design patterns and query optimization techniques for orchestrating distributed GraphQL subgraphs with Apollo Federation.

## Key Concepts

1. **Subgraph Architecture**: Each domain microservice owns its slice of the schema and resolves its own entities.
2. **Entities (`@key`)**:
   - Types that can be referenced or extended across subgraphs using primary keys.
3. **Router / Gateway**:
   - Compiles client queries into query execution plans across downstream subgraphs and composes the final response.

## Best Practices

- **Avoid the N+1 Query Problem**: Use DataLoader inside subgraph resolvers to batch database fetches across nested fields.
- **Contract-Driven Schema Reviews**: Enforce backwards-compatibility checks on PRs using schema linting tools to prevent breaking downstream clients.
- **Strict Error Handling**: Differentiate between partial resolution failures and fatal errors; utilize nullable fields strategically.
