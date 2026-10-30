<script setup lang="ts">
const colorMode = useColorMode()
const { t, locale } = useI18n()
const i18nHead = useLocaleHead()
const appConfig = useAppConfig()
const { mounted: mascotsMounted } = useMascotLayer()
const { public: { siteUrl } } = useRuntimeConfig()

const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')

// Self-hosted social image, resolved to an absolute URL from the normalized site URL
// (OG/Twitter/JSON-LD all require absolute URLs).
const ogImageUrl = `${siteUrl}/images/seo/og-image.jpeg`

// Person + WebSite structured data. `sameAs` is built from the public footer
// profile links (mailto excluded), so social profiles stay in one place.
const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      'name': 'Gabriel Oliveira',
      'jobTitle': t('seo.jobTitle'),
      'description': t('seo.personDescription'),
      'email': appConfig.global?.email,
      'url': siteUrl,
      'image': `${siteUrl}${appConfig.global?.picture?.dark ?? ''}`,
      'knowsAbout': appConfig.global?.knowsAbout,
      'worksFor': {
        '@type': 'Organization',
        'name': 'Oby Capital',
        'url': 'https://www.obycapital.com.br/'
      },
      'sameAs': (appConfig.footer?.links ?? [])
        .map(link => link.to)
        .filter((to): to is string => typeof to === 'string' && to.startsWith('http'))
    },
    {
      '@type': 'WebSite',
      'name': t('seo.siteTitle'),
      'url': siteUrl,
      'inLanguage': locale.value,
      'author': { '@id': `${siteUrl}/#person` }
    }
  ]
}))

useHead(() => ({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
    {
      key: 'google-site-verification',
      name: 'google-site-verification',
      content: 'n8I36DrJQ2f64mqoLeZsvx6rMPghTU1p8BdcgQ40BHA'
    }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    ...(i18nHead.value.link || [])
  ],
  htmlAttrs: {
    ...i18nHead.value.htmlAttrs
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd.value)
    }
  ]
}))

useSeoMeta({
  titleTemplate: (title?: string) => {
    const pageTitle = (title ?? '').trim()
    if (!pageTitle) return t('seo.siteTitle')
    return t('seo.titleWithPage', { title: pageTitle })
  },
  ogImage: ogImageUrl,
  twitterImage: ogImageUrl,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <AppSkipLink />

    <BackgroundSiteParticlesBackground />

    <!-- Decorative mascot layer: client-only, teleported to <body>, pointer-events: none. -->
    <ClientOnly>
      <LazyMascotsMascotWorld v-if="mascotsMounted" />
    </ClientOnly>

    <NuxtLayout>
      <UMain
        id="main-content"
        as="main"
        tabindex="-1"
        class="relative focus:outline-none"
      >
        <NuxtPage />
      </UMain>
    </NuxtLayout>

    <LazyContactModal hydrate-on-idle />
  </UApp>
</template>
