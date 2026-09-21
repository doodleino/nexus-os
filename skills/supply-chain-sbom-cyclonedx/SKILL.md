---
name: supply-chain-sbom-cyclonedx
description: Software Bill of Materials (SBOM) generation with Syft/Trivy, dependency vulnerability scanning, and license compliance.
metadata:
  origin: NEXUS-OS
---

# Supply Chain Security & SBOM (CycloneDX)

Use this skill to generate tamper-evident Software Bills of Materials (SBOM) and audit dependency vulnerability exposure.

## Generation Command

```bash
syft packages dir:. -o cyclonedx-json=sbom.json
trivy sbom sbom.json --severity HIGH,CRITICAL
```
