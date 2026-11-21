import { queryCollection } from '@nuxt/content/server'
import type { LlmsExperience, LlmsProject } from '../utils/llms'

interface ProjectEntry extends LlmsProject {
  stem?: string
  date: string | Date
}

/**
 * `/llms.txt`: a plain Markdown summary of the site for LLM crawlers and AI search.
 * Prerendered (see `nitro.prerender.routes`), so it ships as a static file.
 * Base URL follows `runtimeConfig.public.siteUrl`; projects and experience come from the English
 * content collections so the file never drifts from the site (see `server/utils/llms.ts`).
 * `/speaking` (placeholder events) is intentionally omitted.
 */
export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)

  const all = await queryCollection(event, 'projects').all() as ProjectEntry[]
  const projects = all
    .filter(project => !project.stem?.startsWith('pt/') && !project.stem?.startsWith('es/'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const home = await queryCollection(event, 'index').path('/').first() as { experience?: { items?: LlmsExperience[] } } | null

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildLlmsTxt({
    siteUrl,
    projects,
    experience: home?.experience?.items ?? [],
    meetingUrl: 'https://cal.com/gabriel-faria07',
    linkedinUrl: 'https://www.linkedin.com/in/faria0703',
    githubUrl: 'https://github.com/Gabriel-br07'
  })
})
