---
name: audit-nuxt-ssr
description: Use when reviewing a change (or AI-generated code) in this Nuxt 4 app for SSR, hydration, and client/server-boundary issues — hydration mismatches, browser-only APIs running on the server, wrong data-fetching primitive, or SSR-unsafe shared state.
---

# Audit Nuxt SSR

## Purpose
Audit a Nuxt 4 change for SSR, hydration, and client/server-boundary issues.

## Use when
- Reviewing a PR or AI-generated change
- Investigating a hydration mismatch
- Checking whether a page/component is Nuxt-idiomatic
- Reviewing data-fetching and runtime placement

## Checklist
- Is any browser-only API (`window`, `document`, `localStorage`, `matchMedia`, `navigator`) used in code that may run on the server? In this repo, client-only work is guarded with `<ClientOnly>` or `import.meta.client` (e.g. `useTypedStrings`, `LazyUContentSearch`).
- Is page data fetched with `useFetch`/`useAsyncData` when SSR matters, and keyed by `locale.value` for localized content?
- Is `$fetch` used appropriately for imperative requests?
- Is shared state SSR-safe (`useState`, not module-level mutable singletons)?
- Could server-rendered markup differ from client-rendered markup (dates, random values, locale)?
- Does any logic belong in `server/api`, middleware, a plugin, a composable, or a component instead of where it is?
- Is `onMounted` being used for data that should have been server-rendered?
- Are loading/error/empty states explicit?
- Are Nuxt auto-imports and file conventions being respected?
- For lazy-hydrated components (`defineLazyHydrationComponent`), is the hydration trigger correct and the module shared (dynamic import only, no parallel static import)?

## Deliverable
Return:
1. Findings
2. Severity
3. Why it is a problem in Nuxt terms
4. Exact file-level fix
5. Minimal refactor suggestion only if it reduces complexity
