---
name: astro-patterns
description: Architect ultra-fast content-driven websites, docs, and web applications using Astro island architecture and content collections.
---

# Astro Patterns

This skill provides design patterns, SEO optimizations, and architectural guidelines for building zero-JS-by-default websites using Astro.

## Core Architectural Concepts

1. **Island Architecture**:
   - Web pages render as static HTML by default.
   - Interactive components (React, Vue, Svelte) hydrate only when explicitly directed via client directives (`client:load`, `client:visible`, `client:idle`).
2. **Type-Safe Content Collections**:
   - Define strict schemas with Zod in `src/content/config.ts` for all Markdown and MDX documents.
   - Enforce frontmatter validation at build time.
3. **Hybrid & Server-Side Rendering**:
   - Use static pre-rendering for marketing and documentation pages.
   - Switch to on-demand SSR adapters (Node, Cloudflare, Vercel) for authenticated endpoints and dynamic APIs.

## SEO & Performance Best Practices

- Generate automatic sitemaps using `@astrojs/sitemap`.
- Optimize images automatically using Astro's `<Image />` component with WebP/AVIF conversions.
- Keep client-side bundle sizes to an absolute minimum by deferring hydration until viewport visibility.
