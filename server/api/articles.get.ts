export default defineCachedEventHandler(async (event) => {
  const { locale } = getQuery(event)
  if (!isArticleLocale(locale)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid locale' })
  }

  const { arandu } = useRuntimeConfig(event)
  try {
    return await fetchAranduArticles(locale, arandu.feedUrl)
  } catch (error) {
    // Live feed is down and the Nitro cache is cold: serve the committed snapshot (step 11).
    console.warn('[articles] live feed failed, using snapshot:', error)
    const snapshot = articlesSnapshot[locale]
    if (snapshot.length) return snapshot
    throw createError({ statusCode: 502, statusMessage: 'Articles feed unavailable' })
  }
}, {
  name: 'articles',
  maxAge: 60 * 60,
  staleMaxAge: 60 * 60 * 24,
  swr: true,
  getKey: event => `articles-${String(getQuery(event).locale)}`
})
