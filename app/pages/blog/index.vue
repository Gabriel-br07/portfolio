<script setup lang="ts">
const { t, locale } = useI18n()

usePageSeo(() => ({
  title: t('blog.seoTitle'),
  description: t('blog.seoDescription')
}))

const { data: articles, status, error, refresh } = await useArticles()

useHead(() => ({
  script: [
    {
      key: 'blog-jsonld',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': t('blog.sectionTitle'),
        'inLanguage': locale.value,
        'blogPost': articles.value.map(a => ({
          '@type': 'BlogPosting',
          'headline': a.title,
          'url': a.url,
          'datePublished': a.publishedAt,
          'description': a.excerpt,
          'keywords': a.categories.join(', '),
          ...(a.cover ? { image: a.cover } : {}),
          'author': { '@type': 'Person', 'name': 'Gabriel Faria' }
        }))
      })
    }
  ]
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
      <!-- Client navigation: the request is still in flight -->
      <div
        v-if="status === 'pending'"
        class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
      >
        <span class="sr-only">{{ t('blog.loading') }}</span>
        <div
          v-for="n in 3"
          :key="n"
          class="flex flex-col gap-3"
        >
          <USkeleton class="w-full aspect-[1200/630] rounded-lg" />
          <USkeleton class="h-4 w-1/3" />
          <USkeleton class="h-6 w-5/6" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center gap-4 py-16 text-center"
        role="alert"
      >
        <p class="text-muted max-w-lg px-4">
          {{ t('blog.error') }}
        </p>
        <UButton
          :label="t('blog.retry')"
          variant="outline"
          @click="refresh()"
        />
      </div>

      <div
        v-else-if="!articles?.length"
        class="flex flex-col items-center justify-center py-16 lg:py-20"
        data-mascot-anchor="blog-empty"
      >
        <p class="text-muted text-sm lg:text-base max-w-lg px-4 text-center">
          {{ t('blog.empty') }}
        </p>
      </div>

      <ul
        v-else
        class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <li
          v-for="(article, index) in articles"
          :key="article.id"
        >
          <BlogArticleCard
            :article="article"
            :priority="index === 0"
          />
        </li>
      </ul>
    </UPageSection>
  </UPage>
</template>
