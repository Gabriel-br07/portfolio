import type { MaybeRefOrGetter } from 'vue'

interface PageSeoInput {
  title?: string | null
  description?: string | null
  /** Open Graph type; defaults to `website`. */
  ogType?: 'website' | 'article' | 'profile'
  /** Site-relative share image (`/images/seo/og-oby.png`); without it the global home image from app.vue is kept. */
  image?: string | null
  imageAlt?: string | null
  /** Dedicated SEO override (e.g. content `seo:` block); preferred over title/description. */
  seo?: {
    title?: string | null
    description?: string | null
  } | null
}

/**
 * Open Graph locales by i18n code. hreflang keeps the bare codes (`en`/`pt`/`es`);
 * `og:locale` needs the language_TERRITORY form. Add an entry when a locale is added in nuxt.config.
 */
export const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  pt: 'pt_BR',
  es: 'es_ES'
}

/**
 * Single entry point for per-page SEO. Applies `useSeoMeta`, preferring a
 * dedicated `seo:` block over `title`/`description`, and mirrors them into the
 * Open Graph / Twitter fields. Title flows through the global `titleTemplate`
 * in `app.vue`; the global `og-home.png` share image is set there too and a page replaces it with `image`.
 * Canonical + hreflang are injected by `@nuxtjs/i18n` (`baseUrl`).
 */
export function usePageSeo(input: MaybeRefOrGetter<PageSeoInput | null | undefined>) {
  const { t, locale, locales } = useI18n()
  const route = useRoute()
  const { public: { siteUrl } } = useRuntimeConfig()

  const resolved = computed(() => {
    const v = toValue(input)
    return {
      title: v?.seo?.title || v?.title || '',
      description: v?.seo?.description || v?.description || ''
    }
  })

  // Same URL form as the i18n canonical: no trailing slash, bare site URL for the home.
  const url = computed(() => {
    const path = route.path.replace(/\/+$/, '')
    return `${siteUrl}${path}`
  })

  const ogLocale = computed(() => OG_LOCALES[locale.value])
  const ogLocaleAlternate = computed(() => locales.value
    .map(l => OG_LOCALES[typeof l === 'string' ? l : l.code])
    .filter((l): l is string => !!l && l !== ogLocale.value))

  // `undefined` emits no tag, so pages without `image` keep the global one.
  const image = computed(() => {
    const path = toValue(input)?.image
    return path ? resolveOgImage(siteUrl, path) : undefined
  })
  const imageAlt = computed(() => toValue(input)?.imageAlt || undefined)

  useSeoMeta({
    title: () => resolved.value.title,
    description: () => resolved.value.description,
    ogTitle: () => resolved.value.title,
    ogDescription: () => resolved.value.description,
    ogUrl: () => url.value,
    ogType: () => toValue(input)?.ogType ?? 'website',
    ogSiteName: () => t('seo.siteTitle'),
    ogLocale: () => ogLocale.value,
    ogLocaleAlternate: () => ogLocaleAlternate.value,
    ogImage: () => image.value,
    ogImageWidth: () => image.value ? OG_IMAGE_WIDTH : undefined,
    ogImageHeight: () => image.value ? OG_IMAGE_HEIGHT : undefined,
    ogImageAlt: () => imageAlt.value,
    twitterTitle: () => resolved.value.title,
    twitterDescription: () => resolved.value.description,
    twitterImage: () => image.value,
    twitterImageAlt: () => imageAlt.value
  })
}
