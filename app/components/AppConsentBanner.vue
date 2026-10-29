<script setup lang="ts">
const { t } = useI18n()
const { public: { gaMeasurementId } } = useRuntimeConfig()
const { consent, accept, decline } = useAnalyticsConsent()

// Only rendered inside <ClientOnly>: the prerendered page cannot know the visitor's cookie.
const visible = computed(() => Boolean(gaMeasurementId) && consent.value === null)
</script>

<template>
  <aside
    v-if="visible"
    role="region"
    :aria-label="t('consent.title')"
    class="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl flex-col gap-3 rounded-lg border border-default bg-default p-4 shadow-lg sm:flex-row sm:items-center"
  >
    <p class="flex-1 text-sm text-muted">
      {{ t('consent.description') }}
    </p>
    <div class="flex shrink-0 gap-2">
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        :label="t('consent.decline')"
        @click="decline()"
      />
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        :label="t('consent.accept')"
        @click="accept()"
      />
    </div>
  </aside>
</template>
