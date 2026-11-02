<script setup lang="ts">
const props = defineProps<{ articles: Article[] }>()

const single = computed(() => props.articles.length === 1)
</script>

<template>
  <ul
    class="grid grid-cols-1 gap-6 lg:gap-8"
    :class="single ? '' : 'md:grid-cols-2'"
  >
    <li
      v-for="article in articles"
      :key="article.id"
    >
      <BlogArticleCard
        :article
        :horizontal="single"
      />
    </li>
  </ul>
</template>
