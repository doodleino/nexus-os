---
name: nexus-recipes
description: "Map a described workflow to the right NEXUS-OS command group with run-order and stop conditions. Adds family-grouping, pipeline sequences, and completion verification on top of the flat command catalog."
argument-hint: <workflow description | empty=list all>
origin: NEXUS-OS
metadata:
  version: "1.0.0"
---

# NEXUS-OS Recipes

One entry point for "which group of NEXUS-OS commands runs my workflow, in what
order, and when do I stop."

This skill adds: **family grouping + run-order + stop condition.**

## When to Activate

- "Which command group do I run for <workflow>?"
- "What's the command sequence to build an MVP / fix a defect / refactor?"
- "Show me all NEXUS-OS workflow recipes"
- "How many workflow pipelines does NEXUS-OS have?"
- User invokes `/nexus-recipes` with or without a description.

## Workflow Families

1. **Orchestrator Pipelines (`orch-*`)**:
   - `orch-build-mvp`: Requirements -> Plan -> TDD -> Implement -> Verify
   - `orch-add-feature`: Delta specification -> Plan -> Test -> Implementation -> PR
   - `orch-fix-defect`: Reproduce failing test -> Root cause analysis -> Fix -> Regression guard
   - `orch-refine-code`: Complexity analysis -> Refactor -> Test validation

2. **Autonomous Loops (`loop-*`)**:
   - `loop-start`: Initiate bounded autonomous development loop
   - `loop-status`: Inspect iteration count, memory state, and progress
   - `checkpoint`: Create clean verifiable rollback snapshot

3. **Quality & Security Gates (`quality-gate`, `security-scan`)**:
   - Pre-commit verification
   - OWASP top 10 vulnerability scan
   - Supply-chain IOC detection

4. **Multi-Harness Handoff (`memory`)**:
   - Cross-session memory persistence
   - Codex to Claude to Gemini handoff protocols
