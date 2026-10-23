<script setup lang="ts">
import BookCard from '~/components/books/BookCard.vue'
import { recommendedBooks } from '~/data/recommended-books'

const { t } = useI18n()

usePageSeo(() => ({
  title: t('livros.seoTitle'),
  description: t('livros.seoDescription')
}))
</script>

<template>
  <UPage>
    <UPageHero
      :title="t('livros.sectionTitle')"
      :description="t('livros.sectionDescription')"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <template #title>
        <span data-mascot-anchor="books-title">{{ t('livros.sectionTitle') }}</span>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <div
        class="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <BookCard
          v-for="book in recommendedBooks"
          :key="book.id"
          :book="book"
        />
      </div>
    </UPageSection>
  </UPage>
</template>
