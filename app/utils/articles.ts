// Single place that decides article order and which ones are highlighted.
// Used by /blog and the homepage preview so both always agree.

function timestamp(article: Article): number {
  return new Date(article.publishedAt).getTime()
}

/** Newest first. Articles with an unparseable date are dropped. */
export function sortArticles(articles: readonly Article[]): Article[] {
  return articles
    .filter(article => !Number.isNaN(timestamp(article)))
    .sort((a, b) => timestamp(b) - timestamp(a))
}

/** The newest article is featured; everything else follows in date order. */
export function splitFeatured(articles: readonly Article[]): { featured: Article | null, rest: Article[] } {
  const [featured = null, ...rest] = sortArticles(articles)
  return { featured, rest }
}

/** The `count` most recent articles (homepage preview). */
export function latestArticles(articles: readonly Article[], count = 3): Article[] {
  return sortArticles(articles).slice(0, count)
}
