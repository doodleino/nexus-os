---
name: agent-context-pruning
description: Optimize context window usage, prune stale turn history, and maintain execution state during extended agent sessions.
---

# Agent Context Pruning

This skill provides deterministic patterns for managing LLM context windows in long-running developer workflows, avoiding degradation, truncation, and excessive token usage.

## When to Use

- When conversations exceed 50+ turns or approach context window thresholds (e.g. >150k tokens).
- Before delegating large tasks to subagents to ensure minimal input payloads.
- When an agent gets stuck in cyclical output or begins forgetting earlier directives.

## Key Pruning Strategies

### 1. State Checkpoint Compression
Instead of carrying raw conversational turns across hours of work:
1. Synthesize completed milestones into a compact markdown summary block.
2. Store detailed technical findings in dedicated filesystem artifacts.
3. Reset conversational turn state with a fresh checkpoint referencing the saved artifacts.

### 2. Output Bounding & Tool Discipline
- Always pipe commands that produce large logs through head, tail, or grep filters (`command | head -n 30`).
- Use targeted line slicing (`StartLine`, `EndLine`) when inspecting files instead of full-file dumps.
- Avoid repeating large unchanged code blocks; reference file paths and line ranges.

### 3. Delimiter & Prompt Hygiene
- Isolate system directives cleanly from ephemeral user instructions.
- Strip temporary scratch files and debugging outputs once their objectives have been achieved.
