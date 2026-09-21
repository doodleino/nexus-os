---
name: svelte-5-runes
description: Svelte 5 modern reactivity with runes ($state, $derived, $effect, $props), snippets, and migration from Svelte 4.
metadata:
  origin: NEXUS-OS
---

# Svelte 5 Runes & Modern Reactivity

Use this skill when developing Svelte 5 applications or migrating legacy Svelte 3/4 stores and reactive declarations (`$:`).

## Core Runes

- **`$state()`**: Declares fine-grained reactive state.
- **`$derived()`**: Computes derived values reactively without re-running on unaffected changes.
- **`$effect()`**: Executes side effects with automatic cleanup functions.
- **`$props()`**: Strongly typed component properties with defaults.

```svelte
<script lang="ts">
  interface Props {
    initialCount?: number;
    step?: number;
  }

  let { initialCount = 0, step = 1 }: Props = $props();
  let count = $state(initialCount);
  let double = $derived(count * 2);

  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>

<button onclick={() => count += step}>
  Count: {count} (Double: {double})
</button>
```
