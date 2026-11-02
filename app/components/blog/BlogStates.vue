<script setup lang="ts">
withDefaults(defineProps<{ state: 'pending' | 'error' | 'empty', headingLevel?: 'h2' | 'h3', mascotAnchor?: boolean }>(), { headingLevel: 'h3' })
defineEmits<{ retry: [] }>()

const { t } = useI18n()
</script>

<template>
  <div
    v-if="state === 'pending'"
    class="grid gap-6 md:grid-cols-2"
    aria-busy="true"
  >
    <span class="sr-only">{{ t('blog.loading') }}</span>
    <div
      v-for="n in 2"
      :key="n"
      class="flex flex-col gap-3"
    >
      <USkeleton class="aspect-video w-full rounded-2xl" />
      <USkeleton class="h-4 w-1/3" />
      <USkeleton class="h-6 w-5/6" />
      <USkeleton class="h-4 w-full" />
    </div>
  </div>

  <div
    v-else-if="state === 'error'"
    class="flex flex-col items-center justify-center gap-4 py-16 text-center"
    role="alert"
  >
    <p class="max-w-lg px-4 text-muted">
      {{ t('blog.error') }}
    </p>
    <UButton
      :label="t('blog.retry')"
      variant="outline"
      @click="$emit('retry')"
    />
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center py-16 lg:py-20"
    :data-mascot-anchor="mascotAnchor ? 'blog-empty' : undefined"
  >
    <div class="space-y-4 text-center">
      <component
        :is="headingLevel"
        class="text-3xl font-semibold lg:text-4xl"
      >
        {{ t('blog.comingSoon') }}
      </component>
      <p class="max-w-lg px-4 text-sm text-muted lg:text-base">
        {{ t('blog.comingSoonDescription') }}
      </p>
    </div>
  </div>
</template>
