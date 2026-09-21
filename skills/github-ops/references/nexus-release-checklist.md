# NEXUS-OS Signed Patch Release Checklist

Use this checklist when releasing `nexus-os/nexus-os` where Git tag identity, npm provenance, GitHub Release, and verification evidence must all align.

## Milestone And Contract

- Contract: Ship verified artifacts, maintain canonical release evidence, and ensure all CI gates are green.
- Signing gate: The release tag must be a signed annotated tag on exact green `origin/main`.
- Registry integrity: Publish only the archive packed and verified by the release workflow.
- Treat any non-E404 npm lookup failure as blocking.

## Verification Steps Before Tagging

```bash
git fetch origin main --tags
git rev-parse origin/main
gh run list --repo nexus-os/nexus-os --limit 5
npm view nexus-os dist-tags --json
```

## Checklist

1. Reconfirm the release commit is exact `origin/main`.
2. Verify all CI workflows are passing.
3. Validate catalog counts match (`node scripts/ci/catalog.js --text`).
4. Validate Unicode safety (`node scripts/ci/check-unicode-safety.js`).
5. Run full test suite (`node tests/run-all.js`).
6. Tag signed release and push to remote.
