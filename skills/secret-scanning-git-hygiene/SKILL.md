---
name: secret-scanning-git-hygiene
description: Automated pre-commit secret detection, Gitleaks rules, Git history cleaning, and leak triage.
metadata:
  origin: NEXUS-OS
---

# Secret Scanning & Git Hygiene

Use this skill to prevent private keys, API credentials, and tokens from ever being committed into Git repositories.

## Pre-commit Gitleaks Guard

```bash
# Run local secret scan prior to push
gitleaks detect --source . --verbose --redact
```
