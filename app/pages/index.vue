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
    // Fallback: `.path()` can miss page-type routes; YAML stem matches locale folder (e.g. `index`, `pt/index`).
    const stem = indexCollectionStem(localePath('/'))
    const all = await queryCollection('index').all()
    return all.find(item => (item as { stem?: string }).stem === stem) ?? null
  }
)
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

usePageSeo(() => page.value)
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
