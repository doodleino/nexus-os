---
description: Build hardened multi-stage Docker images, lint Dockerfiles, and verify minimal attack surfaces.
agent: build-error-resolver
subtask: true
---

# Docker Build & Hardening Command

Build container images with multi-stage caching, lint Dockerfiles against security best practices (Hadolint), verify non-root execution, and ensure minimal distroless attack surfaces.

## Usage

`/docker-build [dockerfile-path] [--tag image:tag] [--target stage] [--scan-vulns] [--distroless]`

- `dockerfile-path` (optional): Path to Dockerfile (defaults to `./Dockerfile`).
- `--tag`: Image repository tag to apply on successful build.
- `--target`: Build a specific stage in a multi-stage Dockerfile.
- `--scan-vulns`: Execute container image vulnerability scanning (Trivy) upon completion.
- `--distroless`: Validate that final runtime base image is minimal/distroless (no package managers or shells).

## When to Use

- When building and testing container images locally or in CI pipelines.
- When container builds fail due to dependency caching issues, missing build tools, or layer bloat.
- When hardening production containers against container escapes and root privilege abuse.
- Guided by containerization patterns in `skills/docker-patterns/`.

## Execution Workflow

1. **Dockerfile Static Analysis**:
   - Run linter (Hadolint) to detect common anti-patterns:
     - Using `latest` tag instead of pinned digest/version.
     - Missing `--no-install-recommends` or uncleaned package caches (`rm -rf /var/lib/apt/lists/*`).
     - Executing as root without explicit `USER nonroot` directive.
     - Storing build-time secrets in image layers (`ARG` vs `--mount=type=secret`).

2. **Multi-Stage Build Execution**:
   - Execute build using BuildKit (`DOCKER_BUILDKIT=1`).
   - Leverage layer caching (`--cache-from`, `--cache-to`) for maximum build velocity.
   - Separate heavy compilation environments (Go, Rust, Node build tools) from runtime artifacts.

3. **Runtime Surface & Size Verification**:
   - Inspect final image size and layer distribution (`docker history`).
   - Confirm non-root UID/GID ownership of entrypoint binary and application files.
   - Ensure development dependencies, test files, and package manager binaries are stripped from the final stage.

4. **Security Vulnerability Scan**:
   - If `--scan-vulns` is requested, scan the built image for OS and language-level CVEs.
   - Fail build if Critical or High CVEs with available patches are detected.

## Review Checklist

- [ ] Multi-stage Dockerfile cleanly separates builder from production runtime.
- [ ] Explicit non-root user (`USER nonroot:nonroot`) configured.
- [ ] No secrets or temporary tokens leaked into image metadata or layers.
- [ ] Final image size minimal and optimized for fast container deployment.
- [ ] Container passes vulnerability scanning thresholds.

## Output Contract

Return a structured markdown report:
- **Build Summary**: Image tag, total image size, build duration, cache hit ratio.
- **Security Posture**: Linter findings resolved, runtime user, base image classification.
- **Vulnerability Breakdown**: Discovered CVEs by severity with available fix guidance.
- **Handoff**: Delegated to `build-error-resolver` if compilation or layer build errors occur.
