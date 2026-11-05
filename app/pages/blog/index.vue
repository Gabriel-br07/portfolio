<script setup lang="ts">
const { t, locale } = useI18n()

usePageSeo(() => ({
  title: t('blog.seoTitle'),
  description: t('blog.seoDescription')
}))

const { data: articles, status, error, refresh } = await useArticles()

const split = computed(() => splitFeatured(articles.value ?? []))

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
        'blogPost': [split.value.featured, ...split.value.rest].filter(a => a !== null).map(a => ({
          '@type': 'BlogPosting',
          'headline': a.title,
          'url': canonicalArticleUrl(a.url),
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
      :title="t('blog.title')"
      :description="t('blog.subtitle')"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    />
    <UPageSection
      :ui="{
        container: '!pt-0 max-w-[1180px] gap-10 lg:gap-12'
      }"
    >
      <BlogStates
        v-if="status === 'pending'"
        state="pending"
      />
      <BlogStates
        v-else-if="error"
        state="error"
        @retry="refresh()"
      />
      <BlogStates
        v-else-if="!split.featured"
        state="empty"
        heading-level="h2"
        mascot-anchor
      />
      <template v-else>
        <BlogFeaturedArticle
          :article="split.featured"
          heading-level="h2"
        />
        <section
          v-if="split.rest.length"
          aria-labelledby="all-articles"
          class="flex flex-col gap-6"
        >
          <h2
            id="all-articles"
            class="text-xl font-semibold text-highlighted lg:text-2xl"
          >
            {{ t('blog.allArticles') }}
          </h2>
          <BlogArticleGrid :articles="split.rest" />
        </section>
      </template>
    </UPageSection>
  </UPage>
</template>
