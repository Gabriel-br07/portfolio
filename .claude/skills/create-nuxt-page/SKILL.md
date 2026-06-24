---
name: create-nuxt-page
description: Use when creating or refactoring a route page in this Nuxt 4 app's app/pages/ directory — adding page-level data fetching, splitting page logic into composables/components, or making a page SSR-safe.
---

# Create Nuxt Page

## Purpose
Create or refactor a page in this Nuxt 4 app using idiomatic SSR-safe patterns.

## Use when
- Creating a new route in `app/pages/`
- Refactoring an existing page
- Adding page-level data fetching
- Splitting page logic into composables/components

## Stack assumptions
- Nuxt 4.2.2 · Vue 3.5 · TypeScript · Vite dev server · Nitro runtime
- i18n (`en`/`pt`/`es`, `prefix_except_default`); content via `@nuxt/content` collections

## Workflow
1. Identify the route from the `app/pages/` file location.
2. Decide whether the page should be SSR-rendered, hybrid, or intentionally client-only.
3. For SSR-relevant data, prefer `useFetch`/`useAsyncData`; key by `locale.value` for localized content and resolve paths with `useLocalePath()`.
4. Use `<script setup lang="ts">`.
5. **Set SEO via `usePageSeo()`** — do not hand-roll `useSeoMeta`. See the `seo-audit` skill.
6. Keep page logic thin:
   - page orchestration in the page
   - reusable logic in composables
   - presentation in components
7. Add explicit UI states: loading, error, empty, success. Throw `createError({ statusCode: 404, fatal: true })` when content is missing (see `projects.vue`).
8. Use `useI18n()` `t('...')` for any literal copy; semantic, accessible markup.
9. Avoid browser-only APIs unless properly guarded for client execution.
10. If the page needs backend support, prefer `server/api` or `server/routes`.
11. Summarize changed files and note any SSR/hydration risks.

## Output expectations
- Idiomatic Nuxt 4 page
- Strong typing
- Correct data-fetching primitive
- SEO applied via `usePageSeo()`
- No accidental client-only regression
- No unnecessary abstraction
