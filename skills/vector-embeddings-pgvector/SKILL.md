---
name: vector-embeddings-pgvector
description: High-performance vector embedding generation, chunking strategies, HNSW indexing, and hybrid dense-sparse search using PostgreSQL and pgvector.
metadata:
  origin: NEXUS-OS
---

# Vector Embeddings and pgvector

Use this skill when designing, indexing, or querying high-dimensional vector embeddings with PostgreSQL and the pgvector extension.

## When to Use

- Building retrieval-augmented generation (RAG) pipelines with relational metadata filtering.
- Generating semantic vector embeddings (OpenAI text-embedding-3, Voyage AI, Cohere).
- Tuning PostgreSQL vector indexes (HNSW vs IVFFlat) for latency and recall.
- Implementing hybrid search combining dense vector cosine similarity with full-text BM25 search.

## Schema Architecture

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table with vector embedding column
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tsv_content TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    embedding VECTOR(1536) -- Matches text-embedding-3-small dimension
);

-- Create HNSW index for sub-millisecond approximate nearest neighbor search
CREATE INDEX idx_documents_embedding_hnsw 
ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full-text index for hybrid search
CREATE INDEX idx_documents_tsv ON documents USING gin(tsv_content);
```

## Hybrid Search Query Pattern

Combine dense cosine similarity with sparse keyword rank using Reciprocal Rank Fusion (RRF):

```sql
WITH semantic_search AS (
    SELECT id, RANK() OVER (ORDER BY embedding <=> $1) AS rank
    FROM documents
    ORDER BY embedding <=> $1
    LIMIT 50
),
keyword_search AS (
    SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv_content, plainto_tsquery('english', $2)) DESC) AS rank
    FROM documents
    WHERE tsv_content @@ plainto_tsquery('english', $2)
    LIMIT 50
)
SELECT 
    d.id,
    d.content,
    d.metadata,
    COALESCE(1.0 / (60 + s.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) AS rrf_score
FROM documents d
LEFT JOIN semantic_search s ON d.id = s.id
LEFT JOIN keyword_search k ON d.id = k.id
WHERE s.id IS NOT NULL OR k.id IS NOT NULL
ORDER BY rrf_score DESC
LIMIT 10;
```

## Index Tuning & Best Practices

1. **HNSW vs IVFFlat**: Use HNSW for higher recall (>95%) and speed at the cost of memory. Use IVFFlat only when RAM is severely constrained.
2. **Batch Ingestion**: Bulk load rows before building IVFFlat indexes, or set `maintenance_work_mem = '2GB'` during HNSW index construction.
3. **Query Ef Search**: Set `SET hnsw.ef_search = 100;` in transaction pools to balance queries per second (QPS) with recall.
