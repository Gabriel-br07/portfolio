/**
 * Loads Nuxt Content search/navigation for the blog collection.
 * Fails soft when the blog is unused or the content DB is missing tables (e.g. stale .data cache).
 *
 * Must call useAsyncData / useLazyAsyncData synchronously (not inside an async wrapper)
 * so Nuxt registers them during setup.
 */
export function useBlogSearchData() {
  const navigation = useAsyncData(
    'navigation',
    async () => {
      try {
        return await Promise.all([queryCollectionNavigation('blog')])
      } catch {
        return []
      }
    },
    {
      transform: (data: unknown[]) => data.flat(),
      default: () => []
    }
  )

  const search = useLazyAsyncData(
    'search',
    async () => {
      try {
        return await Promise.all([queryCollectionSearchSections('blog')])
      } catch {
        return []
      }
    },
    {
      server: false,
      transform: (data: unknown[]) => data.flat(),
      default: () => []
    }
  )

  return [navigation, search] as const
}
