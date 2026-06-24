import type { MaybeRefOrGetter } from 'vue'

interface PageSeoInput {
  title?: string | null
  description?: string | null
  /** Dedicated SEO override (e.g. content `seo:` block); preferred over title/description. */
  seo?: {
    title?: string | null
    description?: string | null
  } | null
}

/**
 * Single entry point for per-page SEO. Applies `useSeoMeta`, preferring a
 * dedicated `seo:` block over `title`/`description`. Title flows through the
 * global `titleTemplate` in `app.vue`; the static `ogImage`/`twitterImage` and
 * canonical + hreflang (`useLocaleHead()`) are also set globally there.
 */
export function usePageSeo(input: MaybeRefOrGetter<PageSeoInput | null | undefined>) {
  const resolved = computed(() => {
    const v = toValue(input)
    return {
      title: v?.seo?.title || v?.title || '',
      description: v?.seo?.description || v?.description || ''
    }
  })

  useSeoMeta({
    title: () => resolved.value.title,
    description: () => resolved.value.description
  })
}
