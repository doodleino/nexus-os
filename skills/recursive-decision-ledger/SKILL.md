---
name: recursive-decision-ledger
description: Use when the user asks for repeated rollouts, marked decision processes, high-dimensional search, stochastic optimization, local-optima exploration, ensemble comparison, or recursive reasoning with a visible evidence trail.
license: MIT
metadata:
  origin: NEXUS-OS
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Recursive Decision Ledger

Use this skill when the user is trying to force deeper computation through
repeated rollouts or "Prime Gauss" style recursive prompting. Preserve the useful
part: repeated trials, prior memory, fresh information, and explicit marks.
Remove the unsafe part: pretending the loop proves certainty.

## Ledger Contract

Every rollout should record:

- rollout id and timestamp;
- prior accepted winner and prior watchlist;
- fresh information ingested;
- search space size;
- model families or heuristics used;
- trial count and effective trial count;
- top candidates;
- decision marks;
- coherence marks against the prior ledger;
- promotion gate result.

Prefer JSONL for append-only ledgers and Markdown for human summaries.

## Rollout Loop

1. Load the prior ledger.
2. Capture new information at time-step zero.
3. Run the bounded search.
4. Mark each candidate: accept, watch, reject, decay watch, or needs replay.
5. Compare winners against prior winners and latest marked rollout.
6. Downgrade candidates when drift, tail risk, stale data, or failed replay
   invalidates the previous mark.
7. Append artifacts before summarizing.

## Coherence Mark

Include a compact coherence mark:

```text
Ensemble matches prior winner: true
Recursive matches prior winner: false
Latest rollout match: true
Live promotion allowed: false
Reason: replay and freshness gates not satisfied
```

## Promotion Rules

For trading, capital allocation, production deploys, migrations, or destructive
ops, recursive confidence is not approval.

Default to paper, dry-run, read-only, preview, or staged mode unless the user
explicitly approves the live action and the repo/service gate supports it.

Promote only when:

- the candidate beats the prior accepted winner on the chosen metric;
- correctness and replay checks pass;
- risk limits are explicit;
- the evidence is durable;
- the user has approved the live step when needed.

## Summary Shape

Lead with the decision, not the drama:

```text
Rollout 15 complete. The prior winner still holds, but edge deteriorated 17%.
Status: watch, not live. Next gate: 20 replay fills with fresh orderbook age
below threshold.
```

## Reasoning Models & Thinking Budgets

When driving deep recursive reasoning with modern reasoning models (DeepSeek R1, Claude 3.7 Sonnet thinking mode, OpenAI o1/o3), align the recursive ledger with the model's reasoning trace:

### 1. Thinking Budget Allocation

Allocate explicit thinking budgets per rollout phase to balance depth with token economy:

- **Exploration phase (high search space)**:
  - Claude 3.7: `thinking: { type: "enabled", budget_tokens: 8192 }`
  - OpenAI o1/o3: `reasoning_effort: "high"`
  - DeepSeek R1: Max thinking tokens uncapped (allow full `<think>` derivation)
- **Refinement & Verification phase (bounded candidates)**:
  - Claude 3.7: `thinking: { type: "enabled", budget_tokens: 2048 }`
  - OpenAI o1/o3: `reasoning_effort: "medium"`
- **Final Decision & Artifact Commit phase**:
  - Claude 3.7: `thinking: { type: "disabled" }` or standard direct output
  - OpenAI o1/o3: `reasoning_effort: "low"`

### 2. Trace Separation & Epistemic Invariants

- **Separate `<think>` from state changes**: Modern reasoning traces contain internal hypotheses, counterfactual rollouts, and self-corrections. Never execute tool calls or filesystem writes proposed exclusively inside reasoning traces before the candidate reaches the final action block.
- **Log trace hashes, not raw stream tokens**: To avoid bloating append-only ledgers, record the SHA-256 hash and token count of the model's reasoning chain alongside the candidate decision mark:
  ```json
  {
    "rollout_id": "r-2026-0921-04",
    "model": "claude-3-7-sonnet-20250219",
    "thinking_budget": 4096,
    "thinking_tokens_used": 3412,
    "reasoning_trace_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "mark": "accept",
    "candidate_id": "cand-02"
  }
  ```
- **Context window overflow prevention**: Reset or compact reasoning traces across successive rollouts (`r_n -> r_n+1`). Ingest only the verified ledger state into the next prompt rather than carrying over historical multi-turn reasoning tokens.

