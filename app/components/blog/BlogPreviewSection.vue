<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const { data: articles, status, error, refresh } = await useArticles()

const latest = computed(() => latestArticles(articles.value ?? [], 3))
const featured = computed(() => latest.value[0])
const others = computed(() => latest.value.slice(1))
</script>

<template>
  <div class="flex flex-col gap-6">
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
      v-else-if="!featured"
      state="empty"
    />
    <template v-else>
      <BlogFeaturedArticle
        :article="featured"
        compact
      />
      <BlogArticleGrid
        v-if="others.length"
        :articles="others"
      />
      <div>
        <UButton
          :to="localePath('/blog')"
          :label="t('blog.viewAll')"
          trailing-icon="i-lucide-arrow-right"
          variant="outline"
          color="neutral"
        />
      </div>
    </template>
  </div>
</template>
