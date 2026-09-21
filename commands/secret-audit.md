---
description: Audit Git commit history and working tree for leaked API keys, tokens, and private credentials.
agent: deep-security-auditor
subtask: true
---

# Secret Audit Command

Perform deep entropy scanning and pattern matching across git commit history, staged diffs, untracked files, and environment files to detect leaked credentials, API tokens, certificates, and secrets.

## Usage

`/secret-audit [--all-commits] [--path dir] [--entropy-threshold 4.5] [--install-hook] [--format text|json]`

- `--all-commits`: Scan the entire git commit history (`HEAD~..` or complete branch history), not just uncommitted changes.
- `--path`: Directory or file to scan (defaults to repository root).
- `--entropy-threshold`: Shannon entropy cutoff for high-randomness string detection (default: `4.5`).
- `--install-hook`: Automatically install and configure a pre-commit secret detection hook.
- `--format`: Output format (`text` or `json`).

## When to Use

- Prior to making a private repository public or committing significant configuration changes.
- Immediately after accidental copy-pasting of `.env` files, SSH keys, or cloud provider tokens.
- When performing quarterly security posture reviews or preparing for external penetration testing.
- Guided by secret hygiene workflows in `skills/secret-scanning-git-hygiene/`.

## Execution Workflow

1. **Pattern Matching & Signature Scan**:
   - Scan for known secret patterns:
     - Cloud Provider Credentials (AWS Access Key ID, GCP Service Account JSON, Azure Connection Strings).
     - AI API Keys (Anthropic `sk-ant-*`, OpenAI `sk-*`, HuggingFace `hf_*`, Cohere, Groq).
     - Database connection URLs containing embedded user/password parameters.
     - Private Keys (RSA, ED25519, PGP, TLS certificates).
     - VCS tokens (GitHub Personal Access Tokens `ghp_*`, GitLab, Slack webhooks).

2. **High-Entropy String Detection**:
   - Compute Shannon entropy on Base64, Hexadecimal, and alphanumeric string tokens.
   - Filter out known public IDs, UUIDs, git hashes, and cryptographic test vectors.

3. **Git History Inspection**:
   - If `--all-commits` is specified, traverse all reachable git trees and commits.
   - Flag commits where a secret was committed and subsequently deleted in a later commit (still present in history).

4. **Remediation & Hygiene**:
   - Provide step-by-step instructions for revoking compromised credentials.
   - Outline safe git history scrubbing procedures (`git-filter-repo` or BFG) without damaging branch integrity.
   - Verify that `.gitignore` properly excludes `.env*`, `.pem`, `.key`, and local credential stores.

## Review Checklist

- [ ] Working tree, staged changes, and git history inspected.
- [ ] False positives separated from genuine high-entropy secrets.
- [ ] Active compromised credentials identified for immediate rotation.
- [ ] Proper `.gitignore` rules verified for local configuration files.
- [ ] Automated pre-commit guardrail installed if requested.

## Output Contract

Return a structured markdown report:
- **Findings Summary**: Total scanned files/commits, secrets detected, severity classification.
- **Secret Ledger**: File path, line number, masked secret preview (`sk-ant-***ABCD`), and secret type.
- **Revocation & Purge Guide**: Specific remediation steps for rotation and git history cleanup.
- **Handoff**: Delegated to `deep-security-auditor` for validation.
