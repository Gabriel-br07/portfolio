import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { XMLParser } from 'fast-xml-parser'
import { describe, expect, it } from 'vitest'

/**
 * SEO checks against the production build (`pnpm build` first, with
 * NUXT_PUBLIC_SITE_URL=https://gabrielfaria.dev.br). They validate what crawlers
 * actually receive: sitemap XML, and the canonical/hreflang/robots in the prerendered HTML.
 */
const ROOT = process.cwd()
const PUBLIC_DIR = join(ROOT, '.output/public')
const SITE = 'https://gabrielfaria.dev.br'
const LOCALES = ['en', 'pt', 'es']
const DEFAULT_LOCALE = 'en'
// Public pages deliberately left out of the sitemap (noindex or placeholders).
const NOT_INDEXABLE_PAGES = ['speaking']

const built = existsSync(join(PUBLIC_DIR, 'sitemap_index.xml'))
const suite = built ? describe : describe.skip

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
const asArray = <T>(v: T | T[] | undefined): T[] => v === undefined ? [] : Array.isArray(v) ? v : [v]

/** `https://host` and `https://host/` are the same URL; compare them in one form. */
function normalize(url: string): string {
  const u = new URL(url)
  return `${u.origin}${u.pathname.replace(/\/+$/, '')}`
}

interface SitemapEntry { loc: string, alternates: { hreflang: string, href: string }[], lastmod?: string, raw: string }

function readSitemaps(): SitemapEntry[] {
  const index = parser.parse(readFileSync(join(PUBLIC_DIR, 'sitemap_index.xml'), 'utf8'))
  const locs = asArray<{ loc: string }>(index.sitemapindex.sitemap).map(s => s.loc)
  return locs.flatMap((loc) => {
    const file = join(PUBLIC_DIR, new URL(loc).pathname)
    const xml = readFileSync(file, 'utf8')
    const doc = parser.parse(xml)
    return asArray<Record<string, unknown>>(doc.urlset.url).map(u => ({
      loc: u.loc as string,
      lastmod: u.lastmod as string | undefined,
      raw: JSON.stringify(u),
      alternates: asArray<Record<string, string>>(u['xhtml:link'] as never).map(l => ({
        hreflang: l['@_hreflang']!,
        href: l['@_href']!
      }))
    }))
  })
}

function htmlFor(url: string): string {
  const path = new URL(url).pathname.replace(/\/+$/, '')
  const candidates = [join(PUBLIC_DIR, path, 'index.html'), join(PUBLIC_DIR, `${path}.html`)]
  const file = candidates.find(existsSync)
  if (!file) throw new Error(`No prerendered HTML for ${url}`)
  return readFileSync(file, 'utf8')
}

function tags(html: string, re: RegExp): string[] {
  return [...html.matchAll(re)].map(m => m[1]!)
}

function expectedUrls(): string[] {
  const pagesDir = join(ROOT, 'app/pages')
  // `about.vue` and `blog/index.vue` both map to a single static route (no dynamic segments exist).
  const pages = readdirSync(pagesDir, { withFileTypes: true })
    .flatMap((f) => {
      if (f.isFile() && f.name.endsWith('.vue')) return [f.name.replace(/\.vue$/, '')]
      if (f.isDirectory() && existsSync(join(pagesDir, f.name, 'index.vue'))) return [f.name]
      return []
    })
    .filter(p => !NOT_INDEXABLE_PAGES.includes(p))
  return LOCALES.flatMap(locale => pages.map((page) => {
    const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
    return `${SITE}${prefix}${page === 'index' ? '' : `/${page}`}`
  }))
}

suite('sitemap', () => {
  const entries = built ? readSitemaps() : []

  it('uses absolute https URLs on the production domain, without tracking params', () => {
    expect(entries.length).toBeGreaterThan(0)
    for (const e of entries) {
      expect(e.loc.startsWith(`${SITE}`), e.loc).toBe(true)
      expect(new URL(e.loc).search, e.loc).toBe('')
      for (const a of e.alternates) expect(a.href.startsWith(SITE), a.href).toBe(true)
    }
  })

  it('has no duplicate URLs', () => {
    const locs = entries.map(e => normalize(e.loc))
    expect(new Set(locs).size).toBe(locs.length)
  })

  it('lists every public page of app/pages in every locale, and nothing else', () => {
    const actual = entries.map(e => normalize(e.loc)).sort()
    expect(actual).toEqual(expectedUrls().map(normalize).sort())
  })

  it('excludes noindex pages and redirect sources', () => {
    const locs = entries.map(e => e.loc)
    expect(locs.some(l => /\/(speaking|livros)(\/|$)/.test(l))).toBe(false)
  })

  it('does not emit priority or changefreq (ignored by Google)', () => {
    for (const e of entries) expect(e.raw).not.toMatch(/priority|changefreq/)
  })

  it('only declares lastmod when it is a valid date', () => {
    for (const e of entries.filter(e => e.lastmod)) {
      expect(Number.isNaN(Date.parse(e.lastmod!)), e.loc).toBe(false)
    }
  })

  it('has reciprocal, self-referencing hreflang that only points at listed URLs', () => {
    const byLoc = new Map(entries.map(e => [normalize(e.loc), e]))
    for (const e of entries) {
      const own = normalize(e.loc)
      const targets = e.alternates.filter(a => a.hreflang !== 'x-default')
      expect(targets.map(a => normalize(a.href)), `${own} lists itself`).toContain(own)
      expect(e.alternates.some(a => a.hreflang === 'x-default'), `${own} x-default`).toBe(true)
      for (const a of e.alternates) {
        const peer = byLoc.get(normalize(a.href))
        expect(peer, `${own} -> ${a.href} exists in the sitemap`).toBeDefined()
        if (a.hreflang !== 'x-default') {
          expect(peer!.alternates.map(p => normalize(p.href)), `${a.href} links back to ${own}`).toContain(own)
        }
      }
    }
  })
})

suite('prerendered pages match the sitemap', () => {
  const entries = built ? readSitemaps() : []

  it('canonical, hreflang, lang and robots are consistent with each sitemap entry', () => {
    for (const e of entries) {
      const html = htmlFor(e.loc)
      const url = normalize(e.loc)
      const canonicals = tags(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)
      expect(canonicals.map(normalize), `${url} canonical`).toEqual([url])

      const alternates = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*hreflang="([^"]+)"/g)]
        .map(m => `${m[2]} ${normalize(m[1]!)}`).sort()
      const fromSitemap = e.alternates.map(a => `${a.hreflang} ${normalize(a.href)}`).sort()
      expect(alternates, `${url} hreflang`).toEqual(fromSitemap)

      const robots = tags(html, /<meta[^>]*name="robots"[^>]*content="([^"]+)"/g)
      expect(robots.join(','), `${url} robots`).not.toMatch(/noindex/)

      const locale = LOCALES.find(l => l !== DEFAULT_LOCALE && new URL(e.loc).pathname.startsWith(`/${l}`)) ?? DEFAULT_LOCALE
      expect(tags(html, /<html[^>]*lang="([^"]+)"/g), `${url} lang`).toEqual([locale])
      expect(tags(html, /<meta[^>]*property="og:url"[^>]*content="([^"]+)"/g).map(normalize), `${url} og:url`).toEqual([url])
      expect(tags(html, /<meta[^>]*property="og:locale"[^>]*content="([^"]+)"/g), `${url} og:locale`).toHaveLength(1)
    }
  })
})

suite('excluded pages', () => {
  it('keeps /speaking noindex', () => {
    const html = readFileSync(join(PUBLIC_DIR, 'speaking/index.html'), 'utf8')
    expect(tags(html, /<meta[^>]*name="robots"[^>]*content="([^"]+)"/g).join(',')).toMatch(/noindex/)
  })
})
