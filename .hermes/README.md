# NEXUS-OS for Hermes

This directory contains the NEXUS-OS configuration for the Hermes harness.

## What is installed

- `rules/nexus/` — shared coding rules and guidelines
- `skills/nexus/` — reusable skills
- `commands/` — slash commands
- `AGENTS.md` — agent instructions

## Manual install

```bash
bash ./install.sh --target hermes --profile minimal
```

## Notes

- Hermes config files (`config.yaml`, `.env`, etc.) are **not** touched by NEXUS-OS install.
- Use `npx nexus-os doctor --target hermes` to check install health.
