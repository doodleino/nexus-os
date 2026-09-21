---
name: production-audit
description: Local-evidence production readiness audit for shipped apps, pre-launch reviews, post-merge checks, and "what breaks in prod?" questions without sending repo data to an external audit service. Use when auditing production readiness before launch, after a merge, or when asked what breaks in prod.
metadata:
  origin: community
---

# Production Audit

Use this skill when the user asks whether an application is ready to ship, what
could break in production, or what must be fixed before a launch. This is a
maintainer-safe rewrite of the stale community production-audit idea: it keeps
the useful production-readiness lens and removes unpinned external execution and
third-party data sharing.

## When to Use

- The user asks "is this production-ready", "what would break in prod", "what
  did we miss", "audit this repo", or "ready to ship?"
- A feature was merged and needs a pre-deploy or post-merge risk pass.
- A public launch, demo, customer rollout, or investor walkthrough is close.
- CI is green but the user wants production risk, not only test status.
- A deployed URL, release branch, PR, or current checkout is available for
  evidence gathering.

## When Not to Use

- During active implementation when the right lens is line-level secure coding;
  use `security-review` first.
- For pure libraries, templates, docs-only repos, or scaffolds unless the user
  wants packaging/release readiness rather than application readiness.
- When the user asks for a formal compliance audit. This skill is engineering
  triage, not legal, financial, medical, or regulatory certification.
- When the only available evidence is a product idea with no repo, deployment,
  CI, or runtime surface.

## How It Works

Build the audit from local and user-authorized evidence. Do not run unpinned
remote code, upload repository contents to third-party services, or call
external scanners unless the user explicitly approves that specific tool and
data flow.

Use this order:

1. Establish the release surface.
2. Read recent changes and current branch state.
3. Inspect runtime, auth, data, payment, background-job, AI, and deployment
   boundaries that actually exist in the repo.
4. Check CI, tests, migrations, environment documentation, and rollback path.
5. Produce a short ship/block recommendation with specific fixes.

## Evidence Checklist

Start with cheap, local signals:

```text
git status --short --branch
git log --oneline --decorate -20
git diff --stat origin/main...HEAD
```

Then inspect the project-specific surface:

- Package scripts, CI workflows, release scripts, Docker files, and deployment
  manifests.
- API routes, webhooks, auth middleware, background workers, cron jobs, and
  database migrations.
- Environment variable documentation and startup checks.
- Observability hooks, error reporting, logs, health checks, and dashboards.
- Rollback, seed, migration, and backfill instructions.
- E2E coverage for the user paths that matter most.

If a deployed URL is in scope, use browser or HTTP checks only against that URL
and avoid credentialed actions unless the user supplies a safe test account.

## Risk Lenses

### Security And Auth

- Are public routes, API routes, and admin routes clearly separated?
- Are auth and authorization enforced server-side?
- Are secrets kept out of client bundles, logs, example output, and checked-in
  files?
- Are rate limits, CSRF protections, CORS policy, and upload validation present
  where the app needs them?
- Does the AI or agent surface defend against prompt injection, tool abuse, and
  untrusted content crossing into privileged actions?

### Data Integrity

- Do migrations run forward cleanly and have a rollback or recovery plan?
- Are destructive migrations, backfills, and data imports staged safely?
- Do database policies, grants, and service-role boundaries match the app's
  tenancy model?
- Are retries idempotent for writes, jobs, and webhook handlers?

### Payments And Webhooks

- Are webhook signatures verified before parsing trusted payload fields?
- Is each payment, subscription, or fulfillment webhook idempotent?
- Are replay, duplicate delivery, and out-of-order delivery handled?
- Are test-mode and live-mode credentials separated?

### Operations

- Can the app start from a clean checkout using documented commands?
- Are required environment variables named, validated, and fail-fast?
- Is there a health check that proves dependencies are reachable?
- Are deploy, rollback, and incident-owner paths documented?
- Are logs useful without leaking secrets or personal data?

### User Experience

- Are the launch-critical paths covered on desktop and mobile?
- Are forms usable on mobile without input zoom, layout overlap, or blocked
  submission states?
- Do loading, empty, error, and permission-denied states tell the user what
  happened?
- Is there a support or recovery path when a critical operation fails?

## Scoring

Use scores to force prioritization, not to imply mathematical certainty.

| Band | Score | Meaning |
| --- | --- | --- |
| Blocked | 0-49 | Do not ship until the top risks are fixed |
| Risky | 50-69 | Ship only behind a small rollout or internal beta |
| Launchable With Caveats | 70-84 | Ship if owners accept the listed risks |
| Strong | 85-100 | No obvious launch blockers from available evidence |

Cap the score at `69` if any of these are true:

- Authentication or authorization is missing on sensitive data.
- Payment or fulfillment webhooks are not idempotent.
- Required migrations cannot be run safely.
- Secrets are exposed in client bundles, logs, or committed files.
- There is no rollback path for a high-impact release.

Cap the score at `84` if CI is not green or the launch-critical path was not
tested end to end.

## Output Format

Lead with one sentence:

```text
Production audit: 76/100, launchable with caveats, with webhook idempotency and rollback docs as the two risks to fix before public launch.
```

Then list:

- `Blockers`: must-fix items before deploy.
- `High-value fixes`: next fixes if the user wants to improve the score.
- `Evidence checked`: files, commands, CI, deployed URL, or PRs inspected.
- `Evidence missing`: what would change confidence if provided.
- `Next action`: one concrete fix or verification step.

Keep strengths short. The user asked for readiness, so the useful answer is the
remaining risk and the next action.

## Example

User:

```text
is this ready to ship?
```

Response:

```text
Production audit: 68/100, risky, because Stripe webhooks are verified but not idempotent and there is no rollback note for the pending migration.

Blockers:
- Add idempotency for `checkout.session.completed` before fulfilling orders.
- Write and test the rollback path for `20260511_add_billing_state.sql`.

High-value fixes:
- Add a health check that verifies database and payment-provider reachability.
- Add one E2E path for upgrade, webhook fulfillment, and billing-page refresh.

Evidence checked:
- `api/stripe/webhook.ts`
- `db/migrations/20260511_add_billing_state.sql`
- GitHub Actions run for the release branch

Next action: Want me to patch webhook idempotency first?
```

## Anti-Patterns

- Running `npx <package>@latest` or a remote scanner as the default audit path.
- Uploading source, secrets, customer data, or private topology to an external
  audit service without explicit approval.
- Producing a score without naming the evidence checked.
- Treating green CI as production readiness.
- Ending with a generic "let me know what you want to do."

---

## SRE Incident Triage, Root-Cause Tracing & Postmortems

When an outage, latency spike, or critical regression occurs in production, execute an evidence-based incident triage and postmortem workflow:

### 1. Incident Triage Order of Operations

1. **Containment First (Stop the Bleeding)**:
   - Verify if an immediate rollback to the previous release tag or git SHA restores SLO.
   - Flip feature flags or divert traffic away from degraded worker pools.
   - Do NOT attempt exploratory code fixes on production during active severity-1 outages.
2. **Local Evidence Ingestion**:
   - Ingest sanitized error log lines or APM stack traces:
     ```bash
     grep -E "500 Internal Server Error|FATAL|UnhandledPromiseRejection" /var/log/app.log | head -n 50
     ```
   - Identify the earliest timestamp of error onset ($T_0$).

### 2. Git Anomaly & Root-Cause Tracing

Correlate the failure onset timestamp $T_0$ with code changes:

```bash
# Find commits deployed immediately prior to incident onset
git log --since="2026-09-20 14:00" --until="2026-09-20 14:35" --oneline

# Inspect diff of suspected commit
git show <suspect-commit-sha> --stat

# Trace origin of the failing code path
git blame -L 120,145 src/services/payment-processor.ts
```

### 3. Automated Blameless Postmortem Template

Produce an executive and engineering postmortem document (`docs/incidents/INC-<id>-postmortem.md`):

```markdown
# Incident Postmortem: INC-2026-0921 (Degraded API Checkout)

**Date**: 2026-09-21  
**Severity**: Sev-1  
**Lead SRE / Responder**: On-Call Agent / Operator  
**Total Downtime / Degraded Window**: 14 minutes (14:12 UTC – 14:26 UTC)  
**Customer Impact**: 342 checkout attempts returned 500 error; zero financial data loss.

## Executive Summary
At 14:12 UTC, deployment `v2.4.1` introduced an unhandled promise rejection in the Stripe payment webhook handler when processing asynchronous 3D-Secure callbacks. The issue was mitigated at 14:26 UTC by rolling back to `v2.4.0`.

## Chronological Timeline (UTC)
- **14:08**: Deploy `v2.4.1` initiated via CD pipeline.
- **14:12**: Deploy completes; error rate spikes from 0.01% to 14.8%.
- **14:14**: Automated PagerDuty alert triggers on HTTP 5xx rate > 2%.
- **14:16**: SRE triage identifies unhandled rejection in `api/stripe/webhook.ts:88`.
- **14:19**: Decision made to execute immediate rollback to `v2.4.0`.
- **14:26**: Rollback deploy healthy; 5xx error rate returns to 0.00%.

## 5 Whys Root-Cause Analysis
1. **Why did checkout fail?** The webhook handler threw an unhandled null dereference on `event.data.object.customer_details`.
2. **Why was customer_details null?** 3D-Secure guest checkouts omit this object in test-mode webhook fixtures.
3. **Why did tests pass in CI?** CI mock fixtures only modeled standard authenticated checkouts, omitting guest flow variants.
4. **Why was mock fixture coverage incomplete?** Webhook test coverage was scoped only to happy-path card charges.
5. **Why was this not caught before deploy?** Pre-deploy canary analysis was bypassed for hotfix `v2.4.1`.

## Preventative Action Items
- [ ] **Action 1 (Fix)**: Add optional chaining and fallback for `customer_details` in webhook parser (Owner: Backend team, Due: 2026-09-22).
- [ ] **Action 2 (Test)**: Add comprehensive 3D-Secure guest checkout fixture to Playwright E2E suite (Owner: QA/Test team, Due: 2026-09-23).
- [ ] **Action 3 (Guard)**: Enforce mandatory 5-minute canary soak in deployment pipeline for all releases (Owner: Infra team, Due: 2026-09-25).
```

## See Also

- Skill: `security-review`
- Skill: `deployment-patterns`
- Skill: `e2e-testing`
- Skill: `tdd-workflow`
- Skill: `verification-loop`

