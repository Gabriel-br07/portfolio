import { XMLParser } from 'fast-xml-parser'
import type { Article, ArticleLocale } from '../../shared/types/article'

const FEED_LANG: Record<ArticleLocale, string> = { en: 'en', pt: 'br', es: 'es' }

export const ARTICLE_LOCALES = Object.keys(FEED_LANG) as ArticleLocale[]

export function isArticleLocale(value: unknown): value is ArticleLocale {
  return typeof value === 'string' && value in FEED_LANG
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

// Uses the global `fetch` (not Nitro's `$fetch`) so the sync script in step 11 can reuse this file under plain Node.
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
    const url = safeHttpsUrl(item.link)
    const title = stripHtml(text(item.title))
    const published = new Date(text(item.pubDate))
    if (!url || !title || Number.isNaN(published.getTime())) continue

    const media = toArray<Record<string, unknown>>(item['media:content'] as Record<string, unknown>[] | undefined)[0]
    const excerpt = stripHtml(text(item.description))

    articles.push({
      id: guidText(item.guid) || url,
      title,
      url,
      excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217).trimEnd()}…` : excerpt,
      cover: safeHttpsUrl(media?.['@_url']),
      publishedAt: published.toISOString(),
      categories: toArray<unknown>(item.category).map(c => stripHtml(text(c))).filter(Boolean)
    })
  }

  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
