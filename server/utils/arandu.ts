import { XMLParser } from 'fast-xml-parser'
import type { Article, ArticleLocale } from '../../shared/types/article'
// Explicit relative import: scripts/sync-articles.mts runs this file under plain Node (no Nuxt auto-imports).
import { withShareUtm } from '../../shared/utils/article-utm'

const FEED_LANG: Record<ArticleLocale, string> = { en: 'en', pt: 'br', es: 'es' }

export const ARTICLE_LOCALES = Object.keys(FEED_LANG) as ArticleLocale[]

export function isArticleLocale(value: unknown): value is ArticleLocale {
  return typeof value === 'string' && Object.hasOwn(FEED_LANG, value)
}

// `content:encoded` (full article HTML, the bulk of the feed) is left as a raw string so it is never parsed.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  stopNodes: ['rss.channel.item.content:encoded'],
  processEntities: true
})

const toArray = <T>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]

const text = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Cuts on code points (not UTF-16 units) so an emoji is never split into a lone surrogate.
function truncate(value: string, max: number): string {
  const chars = Array.from(value)
  return chars.length > max ? `${chars.slice(0, max - 3).join('').trimEnd()}…` : value
}

function safeHttpsUrl(value: unknown): string | null {
  try {
    const url = new URL(text(value))
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

// `guid` is an object when it carries an `isPermaLink` attribute, a plain string otherwise.
function guidText(guid: unknown): string {
  if (typeof guid === 'object' && guid !== null) {
    return text((guid as Record<string, unknown>)['#text'])
  }
  return text(guid)
}

// Uses the global `fetch` (not Nitro's `$fetch`) so scripts/sync-articles.mts can reuse this file under plain Node.
// Throws on a non-2xx response or a feed with no usable items (e.g. an HTML challenge page served with 200),
// so callers fall back to the committed snapshot instead of caching an empty list.
export async function fetchAranduArticles(locale: ArticleLocale, feedUrl: string): Promise<Article[]> {
  const response = await fetch(feedUrl.replace('{lang}', FEED_LANG[locale]), {
    signal: AbortSignal.timeout(8000),
    headers: { accept: 'application/rss+xml, application/xml, text/xml' }
  })
  if (!response.ok) {
    throw new Error(`Arandu feed responded ${response.status}`)
  }
  const xml = await response.text()

  const parsed = parser.parse(xml)
  const items = toArray<Record<string, unknown>>(parsed?.rss?.channel?.item)

  const articles: Article[] = []
  for (const item of items) {
    const link = safeHttpsUrl(item.link)
    const title = stripHtml(text(item.title))
    const published = new Date(text(item.pubDate))
    if (!link || !title || Number.isNaN(published.getTime())) continue

    const media = toArray<Record<string, unknown>>(item['media:content'] as Record<string, unknown>[] | undefined)[0]
    const excerpt = stripHtml(text(item.description))

    articles.push({
      id: guidText(item.guid) || link,
      title,
      // Share links carry UTM params (cards, featured block, homepage preview); structured data uses `canonicalArticleUrl`.
      url: withShareUtm(link),
      excerpt: truncate(excerpt, 220),
      cover: safeHttpsUrl(media?.['@_url']),
      publishedAt: published.toISOString(),
      categories: toArray<unknown>(item.category).map(c => stripHtml(text(c))).filter(Boolean)
    })
  }

  if (articles.length === 0) {
    throw new Error('Arandu feed contained no articles')
  }

  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
