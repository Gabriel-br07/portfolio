/**
 * Placeholder for content search scoped to the blog area. Returns empty data until blog content is wired back in.
 */
import type { ContentNavigationItem } from '@nuxt/content'

export function useBlogSearchData() {
  const { locale } = useI18n()

  const navigation = useAsyncData(
    () => `navigation-${locale.value}`,
    async () => [] as ContentNavigationItem[],
    {
      watch: [locale],
      default: () => []
    }
  )

  const search = useLazyAsyncData(
    () => `search-${locale.value}`,
    async () => [] as { path?: string }[],
    {
      server: false,
      watch: [locale],
      default: () => []
    }
  )

  return [navigation, search] as const
}
