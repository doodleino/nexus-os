---
name: nextjs-turbopack
description: Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack.
metadata:
  origin: NEXUS-OS
---

# Next.js and Turbopack

Next.js 16+ uses Turbopack by default for local development: an incremental bundler written in Rust that significantly speeds up dev startup and hot updates.

## When to Use

- **Turbopack (default dev)**: Use for day-to-day development. Faster cold start and HMR, especially in large apps.
- **Webpack (legacy dev)**: Use only if you hit a Turbopack bug or rely on a webpack-only plugin in dev. Disable with `--webpack` (or `--no-turbopack` depending on your Next.js version; check the docs for your release).
- **Production**: Production build behavior (`next build`) may use Turbopack or webpack depending on Next.js version; check the official Next.js docs for your version.

Use when: developing or debugging Next.js 16+ apps, diagnosing slow dev startup or HMR, or optimizing production bundles.

## How It Works

- **Turbopack**: Incremental bundler for Next.js dev. Uses file-system caching so restarts are much faster (e.g. 5–14x on large projects).
- **Default in dev**: From Next.js 16, `next dev` runs with Turbopack unless disabled.
- **File-system caching**: Restarts reuse previous work; cache is typically under `.next`; no extra config needed for basic use.
- **Bundle Analyzer (Next.js 16.1+)**: Experimental Bundle Analyzer to inspect output and find heavy dependencies; enable via config or experimental flag (see Next.js docs for your version).

## Examples

### Commands

```bash
next dev
next build
next start
```

### Usage

Run `next dev` for local development with Turbopack. Use the Bundle Analyzer (see Next.js docs) to optimize code-splitting and trim large dependencies. Prefer App Router and server components where possible.

## Middleware File Naming

Next.js 16 introduced `proxy.ts` as the middleware filename, replacing the older `middleware.ts` convention:

- **Next.js 16+**: use `proxy.ts` at the project root
- **Pre-Next.js 16**: use `middleware.ts` at the project root

The filename change is tied to the **Next.js version**, not to which bundler (Turbopack or webpack) is in use. Always check the official docs for the version you are reviewing.

**Do not flag `proxy.ts` as a misnamed or missing middleware file in Next.js 16 projects.** The file is correct and intentional. Suggesting a rename to `middleware.ts` will break middleware execution.

Reference: [Next.js proxy docs](https://nextjs.org/docs/app/getting-started/proxy)

## Best Practices

- Stay on a recent Next.js 16.x for stable Turbopack and caching behavior.
- If dev is slow, ensure you're on Turbopack (default) and that the cache isn't being cleared unnecessarily.
- For production bundle size issues, use the official Next.js bundle analysis tooling for your version.

---

## Next.js 15+ App Router & Server Action Architecture

### 1. Async Request APIs (Next.js 15+ Breaking Change)

In Next.js 15+, request-bound data sources (`params`, `searchParams`, `cookies()`, and `headers()`) are asynchronous. Do NOT access them synchronously:

```typescript
// app/blog/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  // MUST await params and searchParams
  const { slug } = await params;
  const query = await searchParams;

  return <div>Post: {slug}</div>;
}
```

```typescript
// Async headers and cookies
import { cookies, headers } from 'next/headers';

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const headerList = await headers();
  const userAgent = headerList.get('user-agent');
  return { token, userAgent };
}
```

### 2. Hardened Server Actions Pattern

Server actions are public HTTP endpoints under the hood. Always treat input as untrusted:

```typescript
// app/actions/update-profile.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { verifyAuthSession } from '@/lib/auth';

const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(200).optional(),
});

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Enforce Server-Side Authentication
  const user = await verifyAuthSession();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // 2. Validate input schema
  const parsed = UpdateProfileSchema.safeParse({
    displayName: formData.get('displayName'),
    bio: formData.get('bio'),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Mutate database securely
  await db.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  // 4. Revalidate cache
  revalidatePath('/profile');
  return { success: true, message: 'Profile updated successfully.' };
}
```

