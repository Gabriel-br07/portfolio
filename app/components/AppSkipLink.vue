<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-default focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-highlighted focus:ring-2 focus:ring-primary"
  >
    {{ t('a11y.skipToMain') }}
  </a>
</template>
