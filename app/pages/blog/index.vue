<script setup lang="ts">
const { t } = useI18n()

usePageSeo(() => ({
  title: t('blog.seoTitle'),
  description: t('blog.seoDescription')
}))
</script>

<template>
  <UPage>
    <UPageHero
      :title="t('blog.sectionTitle')"
      :description="t('blog.sectionDescription')"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    />
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <div
        class="flex flex-col items-center justify-center py-16 lg:py-20"
        data-mascot-anchor="blog-empty"
      >
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-2">
            <h2 class="text-3xl lg:text-4xl font-semibold motion-safe:animate-pulse">
              {{ t('blog.comingSoon') }}
            </h2>
            <span class="flex gap-1">
              <span
                class="w-2 h-2 bg-primary rounded-full motion-safe:animate-bounce"
                style="animation-delay: 0ms;"
              />
              <span
                class="w-2 h-2 bg-primary rounded-full motion-safe:animate-bounce"
                style="animation-delay: 150ms;"
              />
              <span
                class="w-2 h-2 bg-primary rounded-full motion-safe:animate-bounce"
                style="animation-delay: 300ms;"
              />
            </span>
          </div>
          <p class="text-muted text-sm lg:text-base max-w-lg px-4">
            {{ t('blog.comingSoonDescription') }}
          </p>
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
