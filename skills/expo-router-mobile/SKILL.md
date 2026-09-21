---
name: expo-router-mobile
description: React Native Expo modern architecture with Expo Router, file-based routing, native gestures, and hermetic builds.
metadata:
  origin: NEXUS-OS
---

# Expo Router & Modern Mobile Architecture

Use this skill when developing universal iOS and Android mobile apps using React Native and Expo Router.

## Directory Structure

```text
app/
├── _layout.tsx      # Root Stack / Drawer navigation provider
├── index.tsx        # Home screen (/)
├── (auth)/          # Route group with separate auth layout
│   ├── login.tsx
│   └── signup.tsx
└── user/
    └── [id].tsx     # Dynamic segment (/user/123)
```

## Navigation & Deep Linking Invariant

Always use typed routes and `<Link href="/user/123">` instead of imperative string navigations to guarantee type safety across platforms.
