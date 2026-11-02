// Live feed, cached per locale for 1h (served stale for up to 24h while revalidating).
// Errors are never cached, so a failing feed is retried on the next request.
const getLiveArticles = defineCachedFunction(
  (locale: ArticleLocale, feedUrl: string) => fetchAranduArticles(locale, feedUrl),
  {
    name: 'articles',
    maxAge: 60 * 60,
    staleMaxAge: 60 * 60 * 24,
    swr: true,
    getKey: (locale: ArticleLocale) => locale
  }
)

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)
  if (!isArticleLocale(locale)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid locale' })
  }

  const { arandu } = useRuntimeConfig(event)
  try {
    const articles = await getLiveArticles(locale, arandu.feedUrl)
    setHeader(event, 'cache-control', 's-maxage=3600, stale-while-revalidate=86400')
    return articles
  } catch (error) {
    // Live feed is down (or empty) and there is no cached copy: serve the committed snapshot,
    // with a short CDN lifetime so the live feed is retried soon.
    console.warn('[articles] live feed failed, using snapshot:', error)
    const snapshot = articlesSnapshot[locale]
    if (snapshot.length) {
      setHeader(event, 'cache-control', 's-maxage=60, stale-while-revalidate=300')
      return snapshot
    }
    throw createError({ statusCode: 502, statusMessage: 'Articles feed unavailable' })
  }
})
