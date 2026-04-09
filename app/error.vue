<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

const { t } = useI18n()
const i18nHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    ...i18nHead.value.htmlAttrs
  },
  link: [...(i18nHead.value.link || [])]
}))

useSeoMeta({
  title: () => t('error.title'),
  description: () => t('error.description')
})

const links = useNavLinks()
const [{ data: navigation }, { data: files }] = useBlogSearchData()
</script>

<template>
  <div>
    <AppHeader :links="links" />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
