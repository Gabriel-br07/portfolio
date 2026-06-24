<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()
const i18nHead = useLocaleHead()
const appConfig = useAppConfig()
const { public: { siteUrl } } = useRuntimeConfig()

const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')

// Person + WebSite structured data. `sameAs` is built from the public footer
// profile links (mailto excluded), so social profiles stay in one place.
const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      'name': 'Gabriel Oliveira',
      'email': appConfig.global?.email,
      'url': siteUrl,
      'image': appConfig.global?.picture?.dark,
      'sameAs': (appConfig.footer?.links ?? [])
        .map(link => link.to)
        .filter((to): to is string => typeof to === 'string' && to.startsWith('http'))
    },
    {
      '@type': 'WebSite',
      'name': t('seo.siteTitle'),
      'url': siteUrl
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
  ogImage: 'https://i.imgur.com/xfmm9Ms.jpeg',
  twitterImage: 'https://i.imgur.com/xfmm9Ms.jpeg',
  twitterCard: 'summary_large_image'
})

const links = useNavLinks()
const [{ data: navigation }, { data: files }] = useBlogSearchData()
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>

    <ContactModal />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        shortcut="meta_k"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </UApp>
</template>
