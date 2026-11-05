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

// Only `lang`/`dir`: an error page has no canonical URL or language alternates.
useHead(() => ({
  htmlAttrs: {
    ...i18nHead.value.htmlAttrs
  }
}))

// Error pages must never be indexed. @nuxtjs/robots does not apply its rules to the error
// renderer, so set the meta tag and (server-side) the X-Robots-Tag header explicitly.
const robotsHeader = useResponseHeader('X-Robots-Tag')
if (import.meta.server) robotsHeader.value = 'noindex, nofollow'

useSeoMeta({
  title: () => t('error.title'),
  description: () => t('error.description'),
  robots: 'noindex, nofollow'
})

const links = useNavLinks()
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

    <UToaster />
  </div>
</template>
