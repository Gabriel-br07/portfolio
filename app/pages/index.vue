<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data: page } = await useAsyncData(
  () => `index-${locale.value}`,
  async () => {
    for (const p of contentPathVariants(localePath('/'), route.path)) {
      const doc = await queryCollection('index').path(p).first()
      if (doc) return doc
    }
    return null
  }
)
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <div
      id="contact"
      class="sr-only"
      tabindex="-1"
    />
    <LandingHero :page />
    <LandingTechCarousel />
    <UPageSection
      :ui="{
        container: '!pt-0 lg:grid lg:grid-cols-2 lg:gap-8'
      }"
    >
      <LandingAbout :page />
      <LandingWorkExperience :page />
    </UPageSection>
    <LandingBlog />
    <LandingTestimonials :page />
    <LandingFAQ :page />
  </UPage>
</template>
