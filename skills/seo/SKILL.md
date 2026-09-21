---
name: seo
description: Audit, plan, and implement SEO, ASO (Agentic Search Optimization), and AGO (Generative Engine Optimization) improvements across technical search, llms.txt, AI agent discoverability, structured data, Core Web Vitals, and answer engine citation strategy.
metadata:
  origin: NEXUS-OS
---

# SEO, ASO & Generative Engine Optimization (AGO/GEO)

Improve search visibility and AI agent discovery through technical correctness, performance, structured schemas, and machine-actionable relevance, not gimmicks.

## When to Use

Use this skill when:
- auditing crawlability, indexability, canonicals, or redirects
- improving title tags, meta descriptions, and heading structure
- adding or validating structured data (JSON-LD, Schema.org)
- optimizing for AI agents and LLM crawlers via `llms.txt` and `.well-known/llms.txt` (ASO)
- structuring documentation for generative answer engines like Perplexity, SearchGPT, and Gemini (AGO/GEO)
- auditing Model Context Protocol (MCP) tool descriptions and manifest discoverability
- improving Core Web Vitals
- doing keyword and intent research and mapping queries to action endpoints

## How It Works

### Principles

1. Fix technical blockers before content optimization.
2. One page should have one clear primary search intent.
3. Prefer long-term quality signals over manipulative patterns.
4. Mobile-first assumptions matter because indexing is mobile-first.
5. Recommendations should be page-specific and implementable.

### Technical SEO checklist

#### Crawlability

- `robots.txt` should allow important pages and block low-value surfaces
- no important page should be unintentionally `noindex`
- important pages should be reachable within a shallow click depth
- avoid redirect chains longer than two hops
- canonical tags should be self-consistent and non-looping

#### Indexability

- preferred URL format should be consistent
- multilingual pages need correct hreflang if used
- sitemaps should reflect the intended public surface
- no duplicate URLs should compete without canonical control

#### Performance

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- common fixes: preload hero assets, reduce render-blocking work, reserve layout space, trim heavy JS

#### Structured data

- homepage: organization or business schema where appropriate
- editorial pages: `Article` / `BlogPosting`
- product pages: `Product` and `Offer`
- interior pages: `BreadcrumbList`
- Q&A sections: `FAQPage` only when the content truly matches

### On-page rules

#### Title tags

- aim for roughly 50-60 characters
- put the primary keyword or concept near the front
- make the title legible to humans, not stuffed for bots

#### Meta descriptions

- aim for roughly 120-160 characters
- describe the page honestly
- include the main topic naturally

#### Heading structure

- one clear `H1`
- `H2` and `H3` should reflect actual content hierarchy
- do not skip structure just for visual styling

### Keyword mapping

1. define the search intent
2. gather realistic keyword variants
3. prioritize by intent match, likely value, and competition
4. map one primary keyword/theme to one URL
5. detect and avoid cannibalization

### Internal linking

- link from strong pages to pages you want to rank
- use descriptive anchor text
- avoid generic anchors when a more specific one is possible
- backfill links from new pages to relevant existing ones

### Agentic Search Optimization (ASO) Checklist

Autonomous agents (Claude Code, Cursor, Copilot, Codex, Gemini) search codebases and repositories for tools and skills:

1. **`llms.txt` and `.well-known/llms.txt` Standard**:
   - Provide a concise markdown index summarizing architecture, core commands, and subagents.
   - Include direct markdown links to comprehensive reference docs (`llms-full.txt`).
2. **Action Dispatch Mapping**:
   - Map user intents explicitly to tool names, CLI commands, and subagent names.
   - Reduce ambiguity so probabilistic models don't guess invalid flags or hallucinated tool names.
3. **Model Context Protocol (MCP) Discoverability**:
   - Give each MCP tool a crisp, unambiguous description emphasizing *when* to invoke it.
   - Expose explicit JSON Schema contracts for input parameters and return payloads.
4. **Harness Rules Integration**:
   - Ship native configurations for IDE agents: `.cursor/rules`, `.github/copilot-instructions.md`, `CLAUDE.md`, `.codex/`.

### Generative Engine Optimization (AGO / GEO) Checklist

Generative answer engines (Perplexity, SearchGPT, Gemini, Claude) synthesize multi-source answers based on citation authority:

1. **Definitive Q&A Blocks**:
   - Provide direct, authoritative definitions (e.g. "What is X?", "How does X compare to Y?").
   - Answer the question within the first 1-2 sentences before providing deeper technical nuance.
2. **Comparison Battlecards**:
   - Include structured markdown tables comparing capabilities, latency, memory, and architecture.
   - Answer engines prefer citing clean tabular matrices over prose comparisons.
3. **Knowledge Graph Triplet Anchors**:
   - Structure core relationships as explicit facts: `(Subject, Predicate, Object)`.
   - Reinforce entity recognition across AI model knowledge bases.
4. **Structured JSON-LD Schema**:
   - Implement `SoftwareApplication`, `HowTo`, and `FAQPage` schemas to provide deterministic semantic context to search crawlers.

## Examples

### Title formula

```text
Primary Topic - Specific Modifier | Brand
```

### Meta description formula

```text
Action + topic + value proposition + one supporting detail
```

### JSON-LD example

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title Here",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name"
  }
}
```

### Audit output shape

```text
[HIGH] Duplicate title tags on product pages
Location: src/routes/products/[slug].tsx
Issue: Dynamic titles collapse to the same default string, which weakens relevance and creates duplicate signals.
Fix: Generate a unique title per product using the product name and primary category.
```

## Anti-Patterns

| Anti-pattern | Fix |
| --- | --- |
| keyword stuffing | write for users first |
| thin near-duplicate pages | consolidate or differentiate them |
| schema for content that is not actually present | match schema to reality |
| content advice without checking the actual page | read the real page first |
| generic “improve SEO” outputs | tie every recommendation to a page or asset |

## Related Skills

- `seo-specialist`
- `frontend-patterns`
- `brand-voice`
- `market-research`
