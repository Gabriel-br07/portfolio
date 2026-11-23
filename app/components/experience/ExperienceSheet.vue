<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const localePath = useLocalePath()
const { track } = useAnalytics()

// Fetched on demand (client only) so the home never ships the long text.
const { data, status, refresh } = useExperienceCase(() => props.slug, { lazy: true, server: false })

const state = computed(() => sheetState(status.value, !!data.value))

watch(open, (isOpen) => {
  if (isOpen) track('open_experience_details', { experience: props.slug, surface: 'sheet' })
}, { immediate: true })
</script>

<template>
  <UDrawer
    v-model:open="open"
    direction="bottom"
    :title="data?.detail.title ?? t('experience.sheetTitle')"
    :description="t('experience.sheetDescription')"
    :ui="{ body: 'overflow-y-auto' }"
  >
    <template #body>
      <div
        v-if="state === 'loading'"
        class="space-y-3"
        role="status"
        :aria-label="t('experience.loading')"
      >
        <USkeleton class="h-5 w-2/3" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
        <USkeleton class="h-24 w-full" />
      </div>
      <div
        v-else-if="state === 'error' || !data"
        class="space-y-3"
      >
        <p class="text-sm text-muted">
          {{ t('experience.error') }}
        </p>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :label="t('experience.retry')"
          @click="refresh()"
        />
      </div>
      <ExperienceDetail
        v-else
        :item="data.item"
        :detail="data.detail"
      />
    </template>

    <template #footer>
      <UButton
        :to="localePath(`/experience/${slug}`)"
        color="neutral"
        variant="outline"
        block
        trailing-icon="i-lucide-arrow-right"
        :label="t('experience.openFullPage')"
        @click="open = false"
      />
    </template>
  </UDrawer>
</template>
