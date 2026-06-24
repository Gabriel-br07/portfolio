---
name: create-composable
description: Use when creating or refactoring a composable in this Nuxt 4 app — when logic is reused across pages/components, a component is becoming too stateful, or feature logic needs separating from rendering.
---

# Create Composable

## Purpose
Create or refactor a composable in this Nuxt 4 application.

## Use when
- Logic is reused across pages/components
- A component is becoming too stateful
- Feature logic needs to be separated from rendering

## Workflow
1. Place the file in `app/composables/`.
2. Name it with the `use` prefix (e.g. `useProjectsCollection`, `useContactModal`).
3. Keep the composable focused on a single domain concern.
4. Use `ref`, `computed`, and `watch` only when they clearly improve the model.
5. Use `useState` only when shared SSR-friendly state is actually needed (see `useContactModal`).
6. For localized content fetching, return `useAsyncData` keyed by `locale.value` (see `useProjectsCollection`).
7. Avoid mixing transport, UI rendering assumptions, and domain logic in one composable.
8. Type inputs and outputs explicitly; export shared item types (e.g. `ProjectCollectionItem`).
9. Document side effects and external dependencies.
10. If async behavior exists, make loading/error/data responsibilities obvious.
11. Summarize the public contract of the composable.

## Output expectations
- Clear, narrow responsibility
- Good SSR awareness
- No hidden global state
- Easy to test and reuse
