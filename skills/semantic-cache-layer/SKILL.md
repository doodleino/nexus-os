---
name: semantic-cache-layer
description: High-performance semantic LLM response caching using cosine similarity thresholding with Redis, Valkey, and vector indexes.
metadata:
  origin: NEXUS-OS
---

# Semantic Cache Layer

Use this skill to implement deterministic and fuzzy semantic caching for LLM requests, slashing latency and API expenditures.

## When to Use

- High-frequency user queries with identical intent but varied phrasing.
- Expensive reasoning model completions where near-duplicate prompts are common.
- Rate-limit protection for third-party LLM providers.

## Workflow

1. Compute embedding of incoming normalized user prompt.
2. Execute vector search in Redis/Valkey against existing cached prompt embeddings.
3. If distance metric is below threshold (e.g. `distance <= 0.08` for cosine distance):
   - Cache HIT: Return cached completion immediately.
4. If distance exceeds threshold:
   - Cache MISS: Forward prompt to LLM provider.
   - On completion, write (embedding, prompt, response) to Redis with defined TTL.

## Redis Vector Cache Implementation

```python
import numpy as np
from redis import Redis
from redis.commands.search.query import Query

class SemanticCache:
    def __init__(self, redis_client: Redis, similarity_threshold: float = 0.92):
        self.client = redis_client
        self.threshold = similarity_threshold

    def get(self, query_embedding: list[float]) -> str | None:
        raw_vector = np.array(query_embedding, dtype=np.float32).tobytes()
        q = (
            Query("*=>[KNN 1 @embedding $vec AS score]")
            .return_fields("response", "score")
            .sort_by("score")
            .dialect(2)
        )
        results = self.client.ft("idx:prompt_cache").search(q, query_params={"vec": raw_vector})
        if results.docs and float(results.docs[0].score) <= (1.0 - self.threshold):
            return results.docs[0].response
        return None

    def set(self, query_embedding: list[float], prompt: str, response: str, ttl_seconds: int = 86400):
        key = f"cache:{hash(prompt)}"
        raw_vector = np.array(query_embedding, dtype=np.float32).tobytes()
        self.client.hset(key, mapping={
            "prompt": prompt,
            "response": response,
            "embedding": raw_vector
        })
        self.client.expire(key, ttl_seconds)
```

## Safety Boundaries

- Never cache prompts containing user personal identifiable information (PII) or ephemeral session state.
- Set explicit maximum TTLs (typically 24 to 72 hours) to avoid returning stale business logic.
