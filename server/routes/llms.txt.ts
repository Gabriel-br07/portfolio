import { queryCollection } from '@nuxt/content/server'

interface ProjectEntry {
  stem?: string
  title: string
  description: string
  url: string
  tags: string[]
  date: string | Date
}

/**
 * `/llms.txt`: a plain Markdown summary of the site for LLM crawlers and AI search.
 * Prerendered (see `nitro.prerender.routes`), so it ships as a static file.
 * Base URL follows `runtimeConfig.public.siteUrl`; projects come from the English
 * `projects` content collection so the list never drifts from the site.
 * `/speaking` (placeholder events) and `/blog` (coming soon) are intentionally omitted.
 */
export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)

  const all = await queryCollection(event, 'projects').all() as ProjectEntry[]
  const projects = all
    .filter(project => !project.stem?.startsWith('pt/') && !project.stem?.startsWith('es/'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0] ?? text

  const lines = [
    '# Gabriel Oliveira',
    '',
    '> Fullstack & Back-End Developer. Builds reliable, maintainable, and impactful digital solutions, focused on clarity, collaborative problem-solving, and well-structured software.',
    '',
    'Available in English (default), Portuguese (/pt) and Spanish (/es).',
    '',
    '## Pages',
    '',
    `- [Home](${siteUrl}/): introduction, work experience and technologies`,
    `- [About](${siteUrl}/about): background and interests`,
    `- [Projects](${siteUrl}/projects): selected projects with stack and links`,
    `- [Books](${siteUrl}/books): recommended software engineering books`,
    `- [Portuguese version](${siteUrl}/pt)`,
    `- [Spanish version](${siteUrl}/es)`,
    '',
    '## Projects',
    '',
    ...projects.map(project =>
      `- [${project.title}](${project.url}): ${firstSentence(project.description)} Stack: ${project.tags.join(', ')}.`
    ),
    '',
    '## Experience',
    '',
    '- FullStack Developer at [Oby Capital](https://www.obycapital.com.br/), Jul 2026 to present',
    '- FullStack Developer at [DW Corp](https://dwcorp.com.br/), Feb 2025 to Jul 2026',
    '- Intern at [Serpro](https://www.serpro.gov.br), May 2024 to Feb 2025',
    '',
    '## Profiles',
    '',
    '- [LinkedIn](https://www.linkedin.com/in/faria0703)',
    '- [GitHub](https://github.com/Gabriel-br07)',
    ''
  ]

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
