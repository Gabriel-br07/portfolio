<script setup lang="ts">
const props = defineProps<{ article: Article, priority?: boolean }>()

const { t, locale } = useI18n()

// Fixed UTC time zone so server and client render the same date (no hydration mismatch).
const formattedDate = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: 'medium',
  timeZone: 'UTC'
}).format(new Date(props.article.publishedAt)))
</script>

<template>
  <UPageCard
    variant="outline"
    :to="article.url"
    target="_blank"
    class="group"
  >
    <div class="relative w-full aspect-[1200/630] overflow-hidden rounded-lg bg-elevated">
      <NuxtImg
        v-if="article.cover"
        :src="article.cover"
        width="1200"
        height="630"
        sizes="100vw sm:50vw lg:384px"
        class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
        decoding="async"
        :alt="article.title"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
      />
    </div>

    <time
      :datetime="article.publishedAt"
      class="text-sm text-muted"
    >
      {{ formattedDate }}
    </time>

    <h3 class="text-xl font-semibold text-highlighted">
      {{ article.title }}
    </h3>

    <p class="text-muted line-clamp-3">
      {{ article.excerpt }}
    </p>

    <div
      v-if="article.categories.length"
      class="flex flex-wrap gap-2"
    >
      <UBadge
        v-for="category in article.categories"
        :key="category"
        variant="subtle"
        size="sm"
        color="neutral"
      >
        {{ category }}
      </UBadge>
    </div>

    <span class="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:underline">
      {{ t('blog.readOn') }}
      <UIcon
        name="i-lucide-arrow-up-right"
        class="size-4"
      />
      <span class="sr-only">{{ t('blog.externalLink') }}</span>
    </span>
  </UPageCard>
</template>
