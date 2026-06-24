---
name: seo-audit
description: Use when adding or reviewing SEO on a page in this Nuxt portfolio — setting title/description/OG/canonical, generating OG images, adding JSON-LD, or checking sitemap/robots/hreflang coverage. Documents this repo's SEO conventions and a per-page checklist.
---

# SEO Audit

How SEO works in this Nuxt 4 portfolio, and the checklist for any page change.

## Global setup (`app/app.vue`)
- `useSeoMeta` sets `titleTemplate` from i18n: empty page title → `t('seo.siteTitle')`; otherwise `t('seo.titleWithPage', { title })`. **Do not** set a full title elsewhere — pass only the page-specific part.
- Static OG/Twitter fallback (`ogImage`, `twitterImage`, `twitterCard: 'summary_large_image'`).
- `useLocaleHead()` emits hreflang alternates + `htmlAttrs` (lang/dir) and the canonical link; `theme-color` and `google-site-verification` live here too.
- A single `application/ld+json` block (`Person` + `WebSite`) is injected via `useHead`, built from `app.config.ts` + `runtimeConfig.public.siteUrl`.

## Site-wide config (`nuxt.config.ts`)
- `site: { url, name }` is the single source of truth (env `NUXT_PUBLIC_SITE_URL`), consumed by `@nuxtjs/sitemap` and `@nuxtjs/robots`.
- `@nuxtjs/sitemap` → `/sitemap.xml` (i18n-aware). `@nuxtjs/robots` → managed `robots.txt` referencing the sitemap. **Do not** add a static `public/robots.txt` — it would shadow the module.

## Per-page rule
Every page sets SEO through the shared **`usePageSeo()`** composable (`app/composables/usePageSeo.ts`) — never hand-roll `useSeoMeta` with the `seo?.title ?? title` fallback again. It applies title/description (preferring a dedicated `seo:` block when present) in one call.

- **Content-driven pages** (`index`, `projects`, `about`, `speaking`): pass the content `page` object. It prefers a dedicated `seo: { title, description }` block in the YAML, falling back to `title`/`description`.
- **i18n-string pages** (`books`, `blog`, error): pass `{ title: t('...seoTitle'), description: t('...seoDescription') }`. The key must exist in **all three** locale files (`i18n/locales/{en,pt,es}.json`).

## Images
`NuxtImg` with explicit `width`/`height`, `sizes`, and `loading`/`fetchpriority`/`preload` tuned for LCP (mirror `app/components/projects/ProjectsPageCard.vue`). Remote hosts must be allow-listed in `nuxt.config.ts` `image.domains`/`alias`.

## Per-page checklist
- [ ] Title set via the template (page-specific part only), unique per page.
- [ ] Description present, unique, and localized.
- [ ] `usePageSeo()` called (not raw `useSeoMeta`).
- [ ] OG image generated (or intentionally using the static fallback).
- [ ] Canonical + hreflang alternates present (verify in page source for `/`, `/pt`, `/es`).
- [ ] JSON-LD present where relevant (Person/WebSite global; add page-specific schema only when it adds value).
- [ ] Page appears in `/sitemap.xml` and is not blocked by `robots.txt`.
- [ ] Any new i18n SEO key added to en/pt/es.
- [ ] Images use `NuxtImg` with dimensions; remote host allow-listed.
