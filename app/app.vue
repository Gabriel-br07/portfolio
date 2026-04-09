<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()
const i18nHead = useLocaleHead()

const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')

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
  }
}))

useSeoMeta({
  titleTemplate: (title?: string) => t('seo.titleTemplate', { title: title ?? '' }),
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
