---
name: shadcn-ui-patterns
description: Design, compose, and customize accessible, themeable UI component systems using Tailwind CSS, Radix UI primitives, and shadcn patterns.
---

# shadcn/ui Patterns

This skill covers the architecture, theming, and best practices for creating accessible, copy-paste component systems powered by Tailwind CSS and Radix UI primitives.

## Architectural Philosophy

- **Ownership Over Black Boxes**: Components live directly in your source code (`components/ui/`), not inside an opaque npm dependency.
- **Radix UI Primitives**: Accessible keyboard navigation, focus management, and ARIA attributes out of the box.
- **Tailwind Utility Styling**: Styled with Tailwind CSS classes using `cn()` (`clsx` + `tailwind-merge`).

## Key Conventions

1. **Class Merging Utility (`cn`)**:
   Always wrap conditional class names in the `cn` helper to resolve Tailwind conflicts cleanly:
   ```typescript
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```
2. **CVA for Variants**: Use `class-variance-authority` (cva) to define component variants (e.g. sizes, intents).
3. **CSS Variables for Theming**: Define color tokens (primary, background, foreground, border) in HSL or OKLCH via CSS variables to allow seamless dark/light mode toggling.
