---
name: rag-vector-search
description: Implement hybrid vector search, semantic chunking, and retrieval-augmented generation pipelines for developer knowledge bases.
---

# RAG & Vector Search

This skill covers the engineering of retrieval-augmented generation (RAG) systems using dense embeddings, lexical search, and reranking.

## Core Pipeline

1. **Ingestion & Parsing**:
   - Clean documents and strip irrelevant noise or boilerplate.
   - Preserve hierarchical heading structures (Markdown `#`, `##`) for metadata tagging.
2. **Chunking Strategies**:
   - Chunk by semantic boundaries (functions, paragraphs, headings) rather than arbitrary token counts.
   - Maintain 10-20% chunk overlap to preserve context across boundaries.
3. **Hybrid Retrieval**:
   - Combine dense vector similarity (cosine / dot product) with sparse BM25 keyword search.
   - Reciprocal Rank Fusion (RRF) to blend semantic and exact-match results.
4. **Reranking**:
   - Apply a cross-encoder reranker on the top-50 candidates to produce the final top-5 context injection.

## Invariant Rules

- Never inject retrieved context without source citation metadata (file path, line number, timestamp).
- Check similarity score cutoffs; return a graceful "no relevant context found" instead of hallucinating.
- Keep local embeddings fast and privacy-compliant using on-device models when possible.
