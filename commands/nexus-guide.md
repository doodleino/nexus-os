---
description: Navigate NEXUS-OS's current agents, skills, commands, hooks, install profiles, and architecture docs from the live repository surface.
---

# /nexus-guide

Use this command as a conversational map of NEXUS-OS. It helps the user discover the right agent, skill, or workflow without dumping exhaustive catalog lists.

## Usage

```text
/nexus-guide
/nexus-guide setup
/nexus-guide skills
/nexus-guide commands
/nexus-guide hooks
/nexus-guide install
/nexus-guide find: <query>
/nexus-guide <feature-or-file-name>
```

## Operating Rules

1. Read current repository files before answering when the checkout is available.
2. Prefer current filesystem/catalog data over hard-coded counts.
3. Keep the initial response focused, then offer specific drill-down paths.
4. Link users to canonical files instead of duplicating long sections.
5. Do not invent commands, skills, agents, or install profiles that are not present.

## What To Inspect

Use these files as the canonical map:

- `README.md` for install paths, reset/uninstall guidance, and high-level architecture
- `AGENTS.md` for contributor and project-structure guidance
- `agent.yaml` for exported agent and command surface
- `commands/` for maintained slash-command workflows
- `skills/*/SKILL.md` for reusable skill workflows
- `agents/*.md` for specialized subagent role prompts
- `hooks/README.md` and `hooks/hooks.json` for hook behavior
- `manifests/install-*.json` for selective install modules, components, and profiles
- `scripts/ci/catalog.js --json` for live catalog counts

## Related Commands

- `/project-init` for stack-aware onboarding of a target project
- `/harness-audit` for deterministic repo readiness scoring
- `/skill-health` for skill quality and reliability checks
- `/skill-create` for extracting a new skill from git history
- `/security-scan` for configuration and credential vulnerability review
