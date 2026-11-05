// Tracking params added to Arandu article links shown on the site. Single source of truth:
// the server adds them (`withShareUtm`) and structured data removes them (`canonicalArticleUrl`).
const SHARE_UTM: Record<string, string> = {
  utm_source: 'whatsapp',
  utm_medium: 'social',
  utm_campaign: 'article-share'
}

/** Idempotent: setting the same params again leaves the URL unchanged. */
export function withShareUtm(link: string): string {
  const url = new URL(link)
  for (const [key, value] of Object.entries(SHARE_UTM)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

/** Article URL without the share params, for structured data. Returns the input if it is not a valid URL. */
export function canonicalArticleUrl(link: string): string {
  try {
    const url = new URL(link)
    for (const key of Object.keys(SHARE_UTM)) {
      url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return link
  }
}
