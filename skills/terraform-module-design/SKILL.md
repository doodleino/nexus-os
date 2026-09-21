---
name: terraform-module-design
description: Reusable, hardened Terraform/OpenTofu modules with drift detection, remote state locking, and terratest fixtures.
metadata:
  origin: NEXUS-OS
---

# Terraform & OpenTofu Module Design

Use this skill to author reusable, production-ready Infrastructure as Code (IaC) modules with strict input validation.

## Module Structure

```text
modules/vpc/
├── main.tf        # Resource declarations
├── variables.tf   # Typed input variables with validation blocks
├── outputs.tf     # Explicitly documented outputs
└── versions.tf    # Required provider versions
```
