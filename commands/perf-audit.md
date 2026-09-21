---
description: Audit Core Web Vitals, analyze bundle chunk distribution, and enforce performance budgets.
agent: performance-optimizer
subtask: true
---

# Performance Audit Command

Audit frontend performance against Core Web Vitals thresholds (LCP, INP, CLS), analyze JavaScript bundle sizes, identify render-blocking resources, and enforce performance budgets.

## Usage

`/perf-audit [target-url-or-build-dir] [--budget-config path] [--device mobile|desktop] [--format text|json|markdown]`

- `target-url-or-build-dir` (optional): URL for live Lighthouse/CrUX audits, or directory (e.g., `dist/`, `.next/`) for bundle analysis.
- `--budget-config`: Path to custom `budget.json` specifying max allowable KB per asset chunk and metric targets.
- `--device`: Emulated viewport and network conditions (defaults to `mobile`).
- `--format`: Report output format (`text`, `json`, or `markdown`).

## When to Use

- Before promoting frontend pull requests to production to prevent performance regressions.
- When Largest Contentful Paint (LCP) exceeds 2.5s or Interaction to Next Paint (INP) exceeds 200ms.
- When JavaScript bundles exceed initial chunk size thresholds (>200KB gzip).
- During regular performance profiling guided by `skills/web-vitals-performance-budget/`.

## Execution Workflow

1. **Metric Measurement & Collection**:
   - Collect simulated or field metrics for Core Web Vitals:
     - Largest Contentful Paint (LCP) target <= 2.5s.
     - Interaction to Next Paint (INP) target <= 200ms.
     - Cumulative Layout Shift (CLS) target <= 0.1.
     - First Input Delay (FID) / Total Blocking Time (TBT) target <= 200ms.

2. **Bundle Chunk Analysis**:
   - Inspect build output using visualizers or chunk reports (`rollup-plugin-visualizer` / `webpack-bundle-analyzer`).
   - Identify duplicate dependencies or un-tree-shaken library imports (e.g., full `lodash` vs `lodash-es`).
   - Flag dynamic vendor chunks exceeding budget thresholds.

3. **Critical Path Inspection**:
   - Locate render-blocking stylesheets, synchronous third-party scripts, and un-preloaded fonts.
   - Verify image optimization: correct modern formats (WebP/AVIF), explicit width/height dimensions, and responsive `srcset`.

4. **Remediation Plan**:
   - Recommend code-splitting boundaries (React `lazy()`, Next.js dynamic imports, Vue async components).
   - Detail font optimization strategies (`font-display: swap`, local subsetting, preconnect).
   - Provide concrete configuration patches for bundlers (`vite.config.ts`, `next.config.js`).

## Review Checklist

- [ ] Core Web Vitals measured against Google 75th percentile thresholds.
- [ ] Initial bundle transfer size evaluated against budget (<200KB initial JS).
- [ ] Render-blocking CSS/JS identified with deferral recommendations.
- [ ] Image and font asset delivery optimized with explicit layout sizes.
- [ ] Performance budget assertions added to CI pipeline.

## Output Contract

Return a structured markdown report:
- **Scorecard**: Tabular matrix of CWV metrics (Target vs Actual vs Status).
- **Bundle Breakdown**: Top 5 largest chunks with identified optimization opportunities.
- **Action Items**: Prioritized code and config changes with estimated impact.
- **Handoff**: Delegated to `performance-optimizer` for automated remediation.
