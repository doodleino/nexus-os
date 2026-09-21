---
name: graph-rag-knowledge-graphs
description: Graph-augmented generation combining semantic vector search with entity-relationship knowledge graph traversal using Neo4j and NetworkX.
metadata:
  origin: NEXUS-OS
---

# GraphRAG and Knowledge Graph Traversal

Use this skill when standard vector RAG fails due to multi-hop reasoning, complex relationship traversals, or global entity aggregation.

## When to Use

- Answering questions that require connecting multiple entities across disparate documents.
- Disambiguating entities with identical names but distinct organizational relationships.
- Generating holistic thematic summaries across large unstructured corpora.

## Architecture

```text
User Query
   │
   ├── Vector Retrieval ──> Top Document Chunks (Local Evidence)
   │
   └── Graph Extraction ──> Cypher Subgraph Traversal (Relational Context)
                                  │
                                  ▼
                     Unified Context Assembly
                                  │
                                  ▼
                         Synthesized Response
```

## Neo4j Cypher Traversal Pattern

```cypher
// Extract 2-hop neighborhood around matched entities with relationship properties
MATCH (e:Entity)
WHERE e.name IN $matched_entity_names
MATCH path = (e)-[r:RELATED_TO*1..2]-(target:Entity)
WHERE r.confidence > 0.8
RETURN e.name AS source,
       type(r) AS relation,
       target.name AS target,
       target.summary AS target_context
LIMIT 25;
```

## Invariant Rules

1. **Schema Validation**: Constrain entity types and relation types using strict enums to prevent relationship hallucinations.
2. **Confidence Thresholding**: Prune graph edges with extraction confidence below 0.75.
3. **Hybrid Context Budgeting**: Allocate 40% of the prompt context window to dense vector chunks and 60% to the linearized entity-relation subgraphs.
