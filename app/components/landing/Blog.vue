<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UPageSection
    :title="t('blog.sectionTitle')"
    :description="t('blog.sectionDescription')"
    :ui="{
      container: 'px-0 !pt-0 sm:gap-6 lg:gap-8',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <BlogPreviewSection />
  </UPageSection>
</template>
