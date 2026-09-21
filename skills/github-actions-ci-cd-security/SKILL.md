---
name: github-actions-ci-cd-security
description: Hardened CI/CD pipeline design, OIDC AWS/GCP auth, runner isolation, and SLSA provenance.
metadata:
  origin: NEXUS-OS
---

# GitHub Actions CI/CD Security Hardening

Use this skill to protect CI/CD pipelines against supply chain attacks, credential leakage, and unauthorized workflow dispatch.

## Core Defenses

1. **Pin Actions to Full Commit SHAs**: Avoid `@v4` branch references; pin to full 40-character commit hashes.
2. **OIDC Over Static Keys**: Use OpenID Connect (OIDC) tokens with AWS IAM roles instead of storing long-lived access keys in repository secrets.
3. **Least Privilege Permissions**: Declare explicit top-level `permissions: read-all` in every workflow file.
