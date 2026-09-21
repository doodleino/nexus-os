---
name: nexus-os
description: Development conventions, architecture patterns, and engineering standards for NEXUS-OS.
---

# NEXUS-OS Development Conventions

## Overview

This skill teaches agents the development patterns and architectural conventions used across the NEXUS-OS codebase.

## Tech Stack & Architecture

- **Primary Language**: JavaScript (Node.js 18+)
- **Architecture**: Micro-modular harness adapters, path-contained manifests, deterministic state stores
- **Test Location**: Hermetic test suite under `tests/`

## When to Use This Skill

Activate this skill when:
- Contributing or making changes to the NEXUS-OS repository
- Adding new agents, skills, or slash command workflows
- Writing automated tests matching repository hermetic test runners
- Running validation gates (Unicode safety, catalog consistency, path safety)

## Engineering Discipline Loop

Always follow the standard loop:
1. **Planning Gate**: Inspect repository surface, understand requirements, verify component dependencies.
2. **TDD / Test First**: Write unit and integration tests before modifying runtime logic.
3. **Hermetic Execution**: Do not assume global environment variables or network access during CI.
4. **Path Safety**: Always validate file containment using `realpathNearestExisting` and `isWithinRoot`.
5. **Unicode Cleanliness**: Zero raw emojis or invisible variation selectors in shipped files.
