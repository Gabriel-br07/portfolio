<script setup lang="ts">
const props = defineProps<{ article: Article, horizontal?: boolean }>()

const { t, locale } = useI18n()

// Fixed UTC time zone so server and client render the same date (no hydration mismatch).
const formattedDate = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: 'medium',
  timeZone: 'UTC'
}).format(new Date(props.article.publishedAt)))

const tags = computed(() => props.article.categories.slice(0, 3))
const linkLabel = computed(() => `${props.article.title} ${t('blog.externalLink')}`)
</script>

<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-default bg-elevated/30 transition-colors duration-200 hover:border-primary/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
    :class="horizontal ? 'md:flex-row' : ''"
  >
    <div
      class="aspect-video w-full overflow-hidden bg-elevated"
      :class="horizontal ? 'md:aspect-auto md:w-[45%] md:shrink-0' : ''"
    >
      <NuxtImg
        v-if="article.cover"
        :src="article.cover"
        width="1200"
        height="630"
        sizes="100vw md:50vw lg:560px"
        class="size-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
        decoding="async"
        alt=""
        loading="lazy"
      />
      <div
        v-else
        class="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 to-elevated"
        aria-hidden="true"
      >
        <UIcon
          name="i-lucide-file-text"
          class="size-10 text-muted"
        />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-6">
      <time
        :datetime="article.publishedAt"
        class="text-sm text-muted"
      >
        {{ formattedDate }}
      </time>
      <h3
        class="line-clamp-3 text-xl font-semibold leading-snug text-highlighted"
      >
        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="linkLabel"
          class="outline-none after:absolute after:inset-0 after:content-['']"
        >{{ article.title }}</a>
      </h3>
      <p class="line-clamp-3 text-sm text-muted">
        {{ article.excerpt }}
      </p>
      <div
        v-if="tags.length"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="tag in tags"
          :key="tag"
          variant="subtle"
          size="sm"
          color="neutral"
        >
          {{ tag }}
        </UBadge>
      </div>
      <span
        class="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary group-hover:underline"
        aria-hidden="true"
      >
        {{ t('blog.readOn') }}
        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-4"
        />
      </span>
    </div>
  </article>
</template>
