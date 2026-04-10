export interface ProjectCollectionItem {
  title: string
  description: string
  image: string
  url: string
  tags: string[]
  date: string | Date
}

/**
 * Locale-filtered projects from Nuxt Content `projects` data collection,
 * sorted by date descending (same logic as the Projects page).
 */
export function useProjectsCollection() {
  const localePath = useLocalePath()
  const { locale } = useI18n()

  return useAsyncData(
    () => `projects-${locale.value}`,
    async () => {
      const all = await queryCollection('projects').all()
      const stemPrefix = localePath('/projects').replace(/^\/+|\/+$/g, '')
      const filtered = all.filter((item) => {
        const stem = (item as { stem?: string }).stem ?? ''
        return stem.startsWith(`${stemPrefix}/`)
      })
      return filtered
        .sort((a, b) => {
          const da = new Date((a as ProjectCollectionItem).date).getTime()
          const db = new Date((b as ProjectCollectionItem).date).getTime()
          return db - da
        }) as ProjectCollectionItem[]
    }
  )
}
