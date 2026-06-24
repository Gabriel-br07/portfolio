# Project guide for Claude Code

You are working in a Nuxt 4 application using Vue 3.5, Vite 7, Nitro 2, and pnpm 10.

## Stack & layout
- **Nuxt 4.2.2 · Vue 3.5 · TypeScript · Nuxt UI 4 · Nuxt Content 3** (YAML collections) · **@nuxtjs/i18n** · **@nuxt/image** · **@nuxtjs/sitemap** · **@nuxtjs/robots** · `motion-v`.
- **i18n**: locales `en` (default), `pt`, `es`; strategy `prefix_except_default` (`/about`, `/pt/about`, `/es/about`). UI strings live in `i18n/locales/{en,pt,es}.json`.
- **Content**: collections defined in `content.config.ts`; localized content under `content/`, `content/pt/`, `content/es/`. Filtered by locale via `queryCollection(...).all()` + stem-prefix matching (see `app/composables/useProjectsCollection.ts`).
- **Rendering**: static prerender (`nitro.prerender`, `/`, `/pt`, `/es`, `crawlLinks`).

## Commands
- `pnpm dev` — dev server
- `pnpm build` / `pnpm preview` — production build / preview
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm typecheck` — `nuxt typecheck` (vue-tsc)
- No test runner is configured.

## Conventions observed in this repo
- Components are **PascalCase**, grouped by feature: `app/components/<feature>/Name.vue`.
- Composables use the `use*` prefix in `app/composables/`.
- **All user-facing text goes through `useI18n()` `t('...')`** — never hardcode copy in components.
- `NuxtImg` with explicit `width`/`height` (and `sizes`/`loading`/`fetchpriority`/`preload` for LCP — see `app/components/projects/ProjectsPageCard.vue`).
- Page SEO goes through the shared `usePageSeo()` composable (see the `seo-audit` skill).
- ESLint stylistic rules enforced: **`commaDangle: 'never'`** and **`braceStyle: '1tbs'`** — match these when writing code.

## Core framework expectations
- Prefer official Nuxt patterns over custom abstractions.
- Respect Nuxt file-based architecture and conventions.
- Keep code idiomatic to Nuxt 4 and Vue 3 Composition API.
- Do not introduce patterns that fight Nuxt SSR, auto-imports, routing, or server/runtime boundaries.

## Vue component rules
- Prefer Single File Components (`.vue`).
- Prefer `<script setup lang="ts">` for components.
- Keep components focused, small, and easy to reason about.
- Use PascalCase for component filenames.
- Keep templates declarative and simple; avoid heavy logic directly inside templates.
- Extract reusable non-UI logic to composables.

## TypeScript rules
- Prefer strong typing for props, emits, composables, server responses, and utility return values.
- Use `defineProps` and `defineEmits` with explicit typing when helpful.
- Avoid `any` unless there is a clear and documented reason.
- Prefer narrow, explicit types over broad generic objects.

## Nuxt architecture rules
- Use `pages/` for route-based views.
- Use `components/` for reusable UI.
- Use `composables/` for shared reactive logic.
- Use `server/api` or `server/routes` for backend handlers.
- Use `middleware/` only for route-navigation concerns such as auth, redirects, or access control.
- Do not move business logic into middleware when it belongs in a composable or server endpoint.

## Auto-import and Nuxt DX rules
- Respect Nuxt auto-imports for composables, Vue APIs, and project conventions.
- Do not add unnecessary manual imports for APIs Nuxt already auto-imports.
- Do not replace Nuxt conventions with ad hoc helpers unless there is a strong architectural reason.

## Data fetching rules
- For page-critical data, prefer `useFetch` or `useAsyncData`.
- Prefer `$fetch` for imperative requests and non-page-centric calls.
- Do not fetch SSR-relevant page data only in `onMounted` unless the page is intentionally client-only.
- When using async data, ensure the data key and lifecycle make sense for caching and reactivity (key by `locale.value` when content is localized).
- Avoid duplicate fetching patterns that can cause unnecessary client/server requests.

## State rules
- Prefer `useState` for shared SSR-friendly state.
- Use `ref`/`computed` for local component state.
- Do not create accidental cross-request shared state on the server.
- Introduce an external store only when the domain complexity justifies it.

## SSR and hydration rules
- Assume code may execute on the server first.
- Guard browser-only APIs such as `window`, `document`, `localStorage`, `matchMedia`, and `navigator`.
- Prevent hydration mismatches by avoiding server/client divergent rendering without clear guards.
- Be explicit when code is client-only (`<ClientOnly>`, `import.meta.client`).

## Performance and maintainability rules
- Prefer `computed` over repeated derived logic.
- Avoid unnecessary watchers.
- Avoid oversized components and god-composables.
- Keep data flow and responsibility boundaries obvious.
- Prefer simple solutions over premature abstraction.

## Accessibility and UX rules
- Prefer semantic HTML first.
- Preserve keyboard accessibility and correct labeling.
- For page-level work, account for loading, empty, success, and error states.

## Change discipline
- Stay within requested scope.
- Do not perform broad refactors unless they clearly reduce complexity or fix a real issue.
- When editing structure, explain the architectural impact in Nuxt terms.
- When creating files, place them in the idiomatic Nuxt location.

## Skills
Project skills live in `.claude/skills/`: `create-nuxt-page`, `create-vue-component`,
`create-composable`, `audit-nuxt-ssr`, `review-vue-nuxt-architecture`, `seo-audit`.
