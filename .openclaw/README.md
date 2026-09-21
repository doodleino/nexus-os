# NEXUS-OS for OpenClaw

This directory contains the NEXUS-OS configuration for the OpenClaw harness.

## What is installed

- `rules/nexus/` — shared coding rules and guidelines
- `skills/nexus/` — reusable skills
- `commands/` — slash commands
- `AGENTS.md` — agent instructions

## Manual install

```bash
bash ./install.sh --target openclaw --profile minimal
```

## Notes

- OpenClaw config files (`openclaw.json`, `config.toml`, `.env`, etc.) are **not** touched by NEXUS-OS install.
- Use `npx nexus-os doctor --target openclaw` to check install health.
