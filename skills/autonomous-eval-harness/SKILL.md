---
name: autonomous-eval-harness
description: Design and execute rigorous automated LLM evaluation pipelines, synthetic ground-truth test datasets, and scoring benchmarks.
---

# Autonomous Evaluation Harness

This skill provides methodologies for building deterministic evaluation suites and benchmarks for LLM workflows, coding agents, and prompt pipelines.

## Evaluation Dimensions

1. **Functional Correctness**: Does the model output pass unit tests, compile cleanly, and execute without runtime errors?
2. **Behavioral Consistency**: Does the model adhere to system rules, formatting instructions, and safety constraints across repeated trials?
3. **Latency & Cost Efficiency**: Turn count, token consumption, and execution duration required to achieve the goal.

## Harness Architecture

1. **Test Case Dataset**:
   - Curated real-world task definitions with unambiguous inputs, expected assertions, and environment setups.
2. **Execution Sandbox**:
   - Hermetic ephemeral container or directory isolating each run to prevent state leakage between test cases.
3. **Scoring & Grading**:
   - Deterministic test execution (exit code 0 / passing assertions) as the primary ground truth.
   - LLM-as-a-judge scoring rubrics for subjective dimensions (code clarity, documentation readability) with blind multi-model evaluations.
