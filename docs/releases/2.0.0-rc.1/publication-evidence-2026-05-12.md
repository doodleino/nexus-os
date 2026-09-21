# NEXUS-OS v2.0.0-rc.1 Publication Evidence — 2026-05-12

This is dry-run release evidence only. It does not create a GitHub release, npm
publication, plugin tag, marketplace submission, or announcement post.

## Source Commit

| Field | Evidence |
| --- | --- |
| Upstream main base | `0598af70a51346bae34d987b9bed143386055967` |
| Evidence branch | `codex/release-publication-evidence` |
| Evidence scope | Working tree with this branch's package hygiene and release-doc updates |
| Git remote | `https://github.com/nexus-os/nexus-os.git` |
| Local status caveat | Working tree had the unrelated untracked `docs/drafts/` directory |

The actual release operator should repeat these checks from the final release
commit with a clean checkout before publishing.

## Registry And Release State

| Surface | Command | Result |
| --- | --- | --- |
| GitHub prerelease | `gh release view v2.0.0-rc.1 --repo nexus-os/nexus-os --json tagName,url,isPrerelease` | `release not found` |
| npm dist-tags | `npm view nexus-os dist-tags --json` | `{ "latest": "1.10.0" }` |
| npm package metadata | `node -p "require('./package.json').name + '@' + require('./package.json').version"` | `nexus-os@2.0.0-rc.1` |
| Product identity | `rg -n "NEXUS-OS" README.md CHANGELOG.md docs/releases/2.0.0-rc.1` | Present in README and rc.1 release docs |

## npm Dry Run

The first pack pass exposed local Python bytecode cache files in the tarball
because broad package `files` entries included untracked local `__pycache__`
paths. This branch adds explicit package-file exclusions and a regression test
so `npm pack` fails if Python bytecode appears in the package surface.

| Command | Result |
| --- | --- |
| `node tests/scripts/npm-publish-surface.test.js` | Passed `2/2`; includes Python bytecode exclusion assertion |
| `npm pack --dry-run --json` | `nexus-os-2.0.0-rc.1.tgz`; `entryCount: 965`; `size: 1565968`; `unpackedSize: 4934637`; `hasBytecode: false` |
| `npm publish --tag next --dry-run --json` | Dry-run target is npm registry with `tag next`; `entryCount: 965`; `hasBytecode: false` |

Temporary install smoke:

| Command | Result |
| --- | --- |
| `npm pack --pack-destination /tmp/nexus-publication-smoke-dd9ud5 --json` | Created `nexus-os-2.0.0-rc.1.tgz` for local install smoke |
| `npm install --prefix /tmp/nexus-publication-smoke-dd9ud5 /tmp/nexus-publication-smoke-dd9ud5/nexus-os-2.0.0-rc.1.tgz` | Added 8 packages |
| `node /tmp/nexus-publication-smoke-dd9ud5/node_modules/nexus-os/scripts/nexus.js --help` | Printed NEXUS-OS selective-install CLI help |
| `node /tmp/nexus-publication-smoke-dd9ud5/node_modules/nexus-os/scripts/catalog.js profiles --json` | Returned the 6 install profiles: `minimal`, `core`, `developer`, `security`, `research`, `full` |
| `find /tmp/nexus-publication-smoke-dd9ud5/node_modules/nexus-os -path '*__pycache__*' -o -name '*.pyc' -o -name '*.pyo' -o -name '*.pyd'` | No output |

## Plugin And Harness Evidence

| Surface | Command | Result |
| --- | --- | --- |
| Claude plugin manifest | `claude plugin validate .claude-plugin/plugin.json` | Passed |
| Claude plugin tag preflight | `claude plugin tag .claude-plugin --dry-run` | Blocked by unrelated untracked `docs/drafts/` |
| Claude plugin tag forced dry-run | `claude plugin tag .claude-plugin --dry-run --force` | Would create `nexus--v2.0.0-rc.1` at HEAD; do not use `--force` for real release unless maintainer decides |
| Codex marketplace CLI | `codex plugin marketplace --help` and subcommand help | Supports `add`, `upgrade`, and `remove`; `add` supports repo and local marketplace roots |
| OpenCode package | `npm run build:opencode` | Passed |
| Claude hook/plugin route | `node tests/hooks/hooks.test.js` | Passed `236/236` |
| Codex release surface | `node tests/docs/nexus-tui-release-surface.test.js` | Passed `18/18` |
| Agent/catalog metadata | `node tests/scripts/catalog.test.js` | Passed `7/7` |
| Observability gate | `npm run observability:ready` | Passed `16/16` |

## Clean-Checkout Claude Plugin Smoke

This follow-up pass used a detached clean worktree at
`/tmp/nexus-clean-plugin-evidence` from commit
`bfacf37715b39655cbc2c48f12f2a35c67cb0253`. It used an isolated temp home
(`HOME=/tmp/nexus-clean-plugin-home`) and a temp local project
(`/tmp/nexus-plugin-install-smoke`), so it did not write to the user's real Claude
plugin config.

| Command | Result |
| --- | --- |
| `git -C /tmp/nexus-clean-plugin-evidence status --short --branch` | `## HEAD (no branch)` with no dirty or untracked files |
| `claude plugin validate .claude-plugin/plugin.json` | Passed |
| `claude plugin validate .claude-plugin/marketplace.json` | Passed |
| `claude plugin tag .claude-plugin --dry-run` | Passed without `--force`; would create `nexus--v2.0.0-rc.1` at HEAD and push `refs/tags/nexus--v2.0.0-rc.1` |
| `claude plugin marketplace add /tmp/nexus-clean-plugin-evidence --scope local` with temp `HOME` | Added marketplace `nexus` in local settings |
| `claude plugin list --available --json` with temp `HOME` | Listed `nexus-os@nexus-os`, version `2.0.0-rc.1`, source `./` |
| `claude plugin install nexus-os@nexus-os --scope local` with temp `HOME` | Installed `nexus-os@nexus-os` in local scope |
| `claude plugin list --json` with temp `HOME` | Listed `nexus-os@nexus-os`, version `2.0.0-rc.1`, enabled, local scope, install path under `/tmp/nexus-clean-plugin-home/.claude/plugins/cache/nexus-os/nexus-os/2.0.0-rc.1` |
| `claude plugin uninstall nexus-os@nexus-os --scope local` with temp `HOME` | Uninstalled successfully; final plugin list was `[]` |

## Announcement Placeholder Check

The forbidden-placeholder scan only returned the publication-readiness checklist
lines that name those forbidden placeholders. No launch-pack placeholder
instances were found.

## Remaining Blockers

- Create or verify GitHub prerelease `v2.0.0-rc.1`.
- Publish `nexus-os@2.0.0-rc.1` with npm dist-tag `next`.
- Create and push the Claude plugin tag only after explicit approval. The clean
  checkout dry run and temp install smoke now pass.
- Confirm the live Claude/Codex/OpenCode marketplace submission path or record
  the manual submission owner and status.
- Verify NEXUS Tools billing/App/Marketplace claims before using them in launch
  copy.
- Refresh announcement copy with live URLs after release and package/plugin
  URLs exist.
