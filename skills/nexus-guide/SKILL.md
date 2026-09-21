---
name: nexus-guide
description: Guide users through NEXUS-OS's current agents, skills, commands, hooks, rules, install profiles, and project onboarding by reading the live repository surface before answering.
metadata:
  origin: NEXUS-OS
---

# NEXUS-OS Guide

Use this skill when a user needs help understanding, navigating, installing, or choosing parts of NEXUS-OS.

## When To Use

Use this skill when the user:

- asks what NEXUS-OS includes
- wants help finding a skill, command, agent, hook, rule, or install profile
- is new to the repository and needs a guided path
- asks "how do I do X with NEXUS-OS?"
- asks which NEXUS-OS components fit a project
- needs an explanation of how commands, skills, agents, hooks, and rules relate
- is deciding between install profiles or selective component packages

## Core Principle

Answer from current files, not memory. NEXUS-OS evolves quickly, so inspect the relevant files before giving a concrete answer:

```bash
node scripts/ci/catalog.js --json
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --list-components --json
```

## Repository Map

- `README.md`: install paths, uninstall/reset guidance, architecture overview
- `AGENTS.md`: contributor guidance and project structure
- `agent.yaml`: exported gitagent surface and command list
- `commands/`: maintained slash-command workflows
- `skills/*/SKILL.md`: reusable workflows and domain playbooks
- `agents/*.md`: specialized delegated subagent role prompts
- `rules/`: language, framework, and harness rules
- `hooks/`: hook behavior, quality gates, and safety verification
- `manifests/`: selective install modules, components, and profiles

## Response Style

Lead with the answer, then give the next action. Most users need the specific command or skill for their task, not an exhaustive dump.
