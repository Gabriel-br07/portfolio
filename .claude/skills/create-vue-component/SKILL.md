---
name: create-vue-component
description: Use when creating or refactoring a Vue component in this Nuxt 4 + Vue 3.5 app — building reusable UI, extracting large page-local markup, or creating feature-specific presentational units.
---

# Create Vue Component

## Purpose
Create or refactor a Vue component for this Nuxt 4 + Vue 3.5 app.

## Use when
- Building reusable UI components
- Refactoring large page-local markup
- Creating feature-specific presentational units

## Workflow
1. Use a Single File Component, placed in `app/components/<feature>/Name.vue` (PascalCase).
2. Prefer `<script setup lang="ts">`.
3. Type props and emits clearly with `defineProps<...>()` / `defineEmits<...>()`.
4. Keep the component focused on one responsibility.
5. Keep business logic out of the template.
6. Extract reusable stateful logic to a composable if needed.
7. Route all user-facing text through `useI18n()` `t('...')` — no hardcoded copy.
8. Use Nuxt UI components (`U*`) and `NuxtImg` (with explicit `width`/`height`) where applicable.
9. Preserve semantic HTML and keyboard accessibility (`aria-*`, focus states).
10. Avoid over-configurable components unless there is a real reuse need.
11. If the component depends on browser-only behavior, guard client-only code properly.
12. Match ESLint stylistic rules: `commaDangle: 'never'`, `braceStyle: '1tbs'`.
13. Summarize the component API: props, emits, slots, dependencies.

## Output expectations
- Small, readable component
- Stable and typed API
- Simple template
- No unnecessary watcher-heavy logic
