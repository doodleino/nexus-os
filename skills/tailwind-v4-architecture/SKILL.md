---
name: tailwind-v4-architecture
description: Tailwind CSS v4 CSS-first configuration, CSS theme variables engine, lightningcss compiler, and zero-config setup.
metadata:
  origin: NEXUS-OS
---

# Tailwind CSS v4 Architecture

Use this skill when developing or upgrading web applications using Tailwind CSS v4.

## Key Changes in Tailwind CSS v4

- **CSS-First Configuration**: The legacy `tailwind.config.js` is superseded by CSS `@theme` directives directly in the main stylesheet.
- **Built-in Lightning CSS**: Eliminates PostCSS and Autoprefixer dependencies with instant Rust-powered compilation.
- **Dynamic CSS Variables**: All design tokens map directly to native CSS variables.

## Main Stylesheet Pattern

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-primary: oklch(0.65 0.24 265);
  --color-brand-accent: oklch(0.78 0.18 160);
  --font-display: "Outfit", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --radius-badge: 0.375rem;
}
```
