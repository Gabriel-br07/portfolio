import { queryCollection } from '@nuxt/content/server'
import type { LlmsCase } from '../utils/llms'

interface CaseDetail {
  stem?: string
  slug: string
  title: string
  themes: LlmsCase['themes']
}

interface HomeItem {
  slug?: string
  position: string
  date: string
  company: LlmsCase['company']
  summary: string
  highlights: string[]
  stack: string[]
}

/**
 * `/llms-full.txt`: the full text of each work-experience case study (English content), in the
 * order of the home timeline. Prerendered like `/llms.txt` (see `nitro.prerender.routes`).
 */
export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)

  const details = await queryCollection(event, 'experiences').all() as CaseDetail[]
  const home = await queryCollection(event, 'index').path('/').first() as { experience?: { items?: HomeItem[] } } | null

  const cases = (home?.experience?.items ?? []).flatMap((item): LlmsCase[] => {
    const detail = details.find(d => d.slug === item.slug && !d.stem?.startsWith('pt/') && !d.stem?.startsWith('es/'))
    if (!detail || !item.slug) return []
    return [{
      slug: item.slug,
      title: detail.title,
      position: item.position,
      date: item.date,
      company: item.company,
      summary: item.summary,
      highlights: item.highlights,
      stack: item.stack,
      themes: detail.themes
    }]
  })

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildLlmsFullTxt({ siteUrl, cases })
})
