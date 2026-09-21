---
name: agentic-eval-benchmarks
description: Automated evaluation harnesses using LLM-as-a-judge, pairwise tournament ranking, and deterministic assertions for agents.
metadata:
  origin: NEXUS-OS
---

# Agentic Evaluation & Benchmarks

Use this skill when establishing regression gates, scoring agent output quality, or running comparative model evaluations on software engineering tasks.

## Metric Pyramid

1. **Deterministic Functional Assertions (L1)**: Build status, test pass rate, lint clean, coverage delta.
2. **Trajectory Efficiency (L2)**: Token consumption, number of tool calls, turn count to resolution.
3. **LLM-as-a-Judge Rubric (L3)**: Architectural clarity, documentation quality, adherence to style guidelines.

## Pairwise Tournament Scoring Pattern

```python
def score_pairwise_outputs(rubric: str, prompt: str, output_a: str, output_b: str) -> dict:
    judge_prompt = f"""
    Evaluate the following two code generation outputs based on the provided rubric.
    
    [Rubric]: {rubric}
    [Prompt]: {prompt}
    
    [Candidate A]: {output_a}
    [Candidate B]: {output_b}
    
    Return JSON with winner (A, B, or TIE) and rationale.
    """
    return run_judge_inference(judge_prompt)
```
