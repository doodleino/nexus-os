---
name: vue-pinia-state-management
description: Modern Vue 3 Composition API state management with Pinia, persistent stores, and SSR hydration.
metadata:
  origin: NEXUS-OS
---

# Vue 3 & Pinia State Management

Use this skill to structure scalable, type-safe global state for Vue 3 and Nuxt applications using Pinia setup stores.

## Setup Store Pattern

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null);
  const isAuthenticated = computed(() => profile.value !== null);

  async function fetchProfile(userId: string) {
    const res = await api.get(`/users/${userId}`);
    profile.value = res.data;
  }

  function logout() {
    profile.value = null;
  }

  return { profile, isAuthenticated, fetchProfile, logout };
});
```
