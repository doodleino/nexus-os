---
name: synthetic-data-generation
description: Structured synthetic dataset generation, schema-guided sampling, and rejection filtering for testing and model evaluation.
metadata:
  origin: NEXUS-OS
---

# Synthetic Data Generation

Use this skill to produce realistic, privacy-compliant mock databases, edge-case unit test fixtures, and supervised training datasets.

## Quality Filters & Rejection Sampling

1. **Schema Validation**: Verify 100% of generated instances against Pydantic/Zod schemas.
2. **Deduplication**: Calculate MinHash / LSH fingerprints to eliminate repetitive patterns.
3. **Adversarial Edge Injections**: Intentionally inject null values, Unicode boundary cases, and extreme numerical values into 10% of test records.
