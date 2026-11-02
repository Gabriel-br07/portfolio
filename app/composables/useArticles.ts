export function useArticles() {
  const { locale } = useI18n()
  return useAsyncData<Article[]>(
    () => `articles-${locale.value}`,
    () => $fetch<Article[]>('/api/articles', { query: { locale: locale.value } }),
    { watch: [locale], default: () => [] }
  )
}
