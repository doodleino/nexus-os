---
description: Generate CycloneDX/SPDX Software Bill of Materials and audit supply chain vulnerabilities.
agent: security-reviewer
subtask: true
---

# Software Bill of Materials (SBOM) Scan Command

Generate standardized CycloneDX or SPDX Software Bill of Materials (SBOM), audit direct and transitive dependencies for known CVEs, detect risky open-source licenses, and verify supply chain integrity.

## Usage

`/sbom-scan [path] [--format cyclonedx-json|spdx-json] [--min-cvss 0-10] [--output file] [--fail-on-license]`

- `path` (optional): Path to project root or lockfile (`package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `Cargo.lock`, `requirements.txt`). Defaults to `.`.
- `--format`: SBOM schema format (`cyclonedx-json` or `spdx-json`).
- `--min-cvss`: Filter vulnerability report by minimum CVSS base score (e.g., `7.0` for High/Critical).
- `--output`: File destination for the generated SBOM artifact.
- `--fail-on-license`: Flag restrictive or non-compliant open source licenses (e.g., AGPL in commercial contexts).

## When to Use

- Prior to creating release tags or publishing packages to npm, PyPI, or container registries.
- When satisfying compliance standards requiring complete dependency inventory (SOC2, ISO 27001, Executive Order 14028).
- When validating that newly added third-party packages do not introduce known vulnerabilities.
- Guided by supply chain security practices in `skills/supply-chain-sbom-cyclonedx/`.

## Execution Workflow

1. **Dependency Graph Ingestion**:
   - Parse package manifests and deterministic lockfiles across detected ecosystems (npm, Cargo, Go modules, pip).
   - Resolve complete dependency tree including transitive sub-dependencies.

2. **SBOM Document Generation**:
   - Emit CycloneDX v1.5/v1.6 JSON specification including package URLs (`purl`), component hashes (SHA-256), author information, and licenses.
   - Attach digital signatures or provenance attestations where configured.

3. **Vulnerability Matching**:
   - Query OSV (Open Source Vulnerabilities), NVD, and GitHub Advisory databases using ecosystem-specific package identifiers.
   - Filter out false positives (e.g., dev-only dependencies in production builds).

4. **License & Compliance Inspection**:
   - Classify all dependency licenses (Permissive: MIT, Apache-2.0, BSD; Copyleft: GPL, AGPL; Unlicensed).
   - Highlight conflicting dual-licensing or missing license declarations.

## Review Checklist

- [ ] Complete SBOM generated in valid CycloneDX or SPDX JSON format.
- [ ] Direct and transitive packages mapped with exact pinned versions.
- [ ] Known CVEs identified with severity, affected version range, and fix versions.
- [ ] License compliance evaluated against repository policy.
- [ ] Actionable upgrade plan provided for vulnerable packages.

## Output Contract

Return a structured markdown report:
- **Inventory Overview**: Total component count, ecosystem breakdown, and SBOM file location.
- **Vulnerability Table**: Component name, installed version, CVE ID, CVSS score, and patched version.
- **License Summary**: Breakdown of detected licenses and highlighted compliance flags.
- **Handoff**: Delegated to `security-reviewer` for patching validation.
