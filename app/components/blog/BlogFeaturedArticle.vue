<script setup lang="ts">
const props = withDefaults(defineProps<{ article: Article, compact?: boolean, headingLevel?: 'h2' | 'h3' }>(), { headingLevel: 'h3' })

const { t, locale } = useI18n()

const formattedDate = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: 'long',
  timeZone: 'UTC'
}).format(new Date(props.article.publishedAt)))

const tags = computed(() => props.article.categories.slice(0, 3))
const linkLabel = computed(() => `${props.article.title} ${t('blog.externalLink')}`)
</script>

<template>
  <article class="group relative grid overflow-hidden rounded-2xl border border-default bg-elevated/30 transition-colors duration-200 hover:border-primary/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary lg:grid-cols-[11fr_9fr]">
    <div
      class="flex flex-col justify-center gap-4 p-6 lg:order-1"
      :class="compact ? 'lg:p-8' : 'lg:p-10'"
    >
      <div class="flex items-center gap-3 text-sm text-muted">
        <UBadge
          variant="subtle"
          size="sm"
        >
          {{ t('blog.featured') }}
        </UBadge>
        <time :datetime="article.publishedAt">{{ formattedDate }}</time>
      </div>
      <component
        :is="headingLevel"
        class="font-semibold leading-tight text-highlighted"
        :class="compact ? 'line-clamp-3 text-xl lg:text-2xl' : 'text-2xl lg:text-4xl'"
      >
        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="linkLabel"
          class="outline-none after:absolute after:inset-0 after:content-['']"
        >{{ article.title }}</a>
      </component>
      <p
        class="text-muted"
        :class="compact ? 'line-clamp-2 text-sm' : 'line-clamp-4 text-base lg:text-lg'"
      >
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
        class="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline"
        aria-hidden="true"
      >
        {{ t('blog.readArticle') }}
        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-4"
        />
      </span>
    </div>

    <div class="aspect-video w-full overflow-hidden bg-elevated order-first lg:order-2 lg:aspect-auto lg:min-h-full">
      <NuxtImg
        v-if="article.cover"
        :src="article.cover"
        width="1200"
        height="630"
        sizes="100vw lg:520px"
        class="size-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
        alt=""
        :loading="compact ? 'lazy' : 'eager'"
        :fetchpriority="compact ? 'auto' : 'high'"
      />
      <div
        v-else
        class="flex size-full min-h-40 items-center justify-center bg-gradient-to-br from-primary/15 to-elevated"
        aria-hidden="true"
      >
        <UIcon
          name="i-lucide-file-text"
          class="size-12 text-muted"
        />
      </div>
    </div>
  </article>
</template>
