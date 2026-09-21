# NEXUS-OS for AdaL CLI

This directory contains the NEXUS-OS configuration for the AdaL CLI harness.

## What is installed

- `rules/` — shared coding rules and guidelines
- `skills/` — reusable skills
- `commands/` — slash commands
- `AGENTS.md` — agent instructions

## Manual install

```bash
bash ./install.sh --target adal --profile minimal
```

## Notes

- The `adal` target installs into the project-level `./.adal/` directory.
- AdaL's own config (`~/.adal/settings.json`, MCP servers, plugins) is **not** touched by NEXUS-OS install.
- Use `npx nexus-os doctor --target adal` to check install health.
