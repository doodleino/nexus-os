---
name: continuous-agent-loop
description: Patterns for continuous autonomous agent loops with quality gates, evals, and recovery controls. Use when running an agent loop that must self-check, gate on evals, and recover from failures.
metadata:
  origin: NEXUS-OS
---

# Continuous Agent Loop

This is the v1.8+ canonical loop skill name. It supersedes `autonomous-loops` while keeping compatibility for one release.

## Loop Selection Flow

```text
Start
  |
  +-- Need strict CI/PR control? -- yes --> continuous-pr
  |
  +-- Need RFC decomposition? -- yes --> rfc-dag
  |
  +-- Need exploratory parallel generation? -- yes --> infinite
  |
  +-- default --> sequential
```

## Combined Pattern

Recommended production stack:
1. RFC decomposition (`ralphinho-rfc-pipeline`)
2. quality gates (`plankton-code-quality` + `/quality-gate`)
3. eval loop (`eval-harness`)
4. session persistence (`nanoclaw-repl`)

## Failure Modes

- loop churn without measurable progress
- repeated retries with same root cause
- merge queue stalls
- cost drift from unbounded escalation

## Recovery

- freeze loop
- run `/harness-audit`
- reduce scope to failing unit
- replay with explicit acceptance criteria

## Reasoning Models & Adaptive Thinking in Loops

When operating autonomous continuous loops with reasoning models (Claude 3.7 Sonnet thinking mode, DeepSeek R1, OpenAI o1/o3):

### Adaptive Thinking Budget Strategy

Do not fix thinking budgets statically across the entire loop life-cycle. Scale them dynamically based on loop state:

| Loop Phase | Agent Task | Suggested Budget | Rationale |
|------------|------------|------------------|-----------|
| **Spec & Decomposition** | RFC breakdown, interface design | 4,000 – 8,000 tokens | Needs architectural foresight to prevent downstream refactors. |
| **Unit Implementation** | Writing code to pass red tests | 1,024 – 2,048 tokens | Focused, bounded problem solving; prevents speculative drift. |
| **Flake & Bug Recovery** | 2nd+ failed test retry | 8,000 – 16,000 tokens | Deep root-cause deduction needed to break cyclical churn. |
| **Cleanup & Formatting** | Linting, de-sloppify, docs | 0 tokens (disabled) | Rule-based mechanical tasks do not benefit from latent reasoning. |

### Anti-Churn Safeguards

1. **Reasoning Trace Stripping**: Do not feed the previous turn's entire thought process back into subsequent turns. Retain only the distilled error message, test diff, and code changes to prevent exponential context window inflation.
2. **Thinking Loop Breakers**: If an agent produces >10,000 thinking tokens across 2 consecutive iterations without modifying a source file or test, immediately abort the iteration, drop the thinking budget to 1,024 tokens, and prompt: `"State the single blocking assumption in one sentence."`
3. **Deterministic Seed & Temperature**: Keep reasoning models at `temperature: 1.0` (or model default for reasoning) but ensure environment mocks and test fixtures remain 100% deterministic.

