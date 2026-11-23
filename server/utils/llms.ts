export interface LlmsProject {
  title: string
  description: string
  url: string
  tags: string[]
}

export interface LlmsExperience {
  slug?: string
  position: string
  date: string
  company: { name: string, url?: string }
}

export interface LlmsCase {
  slug: string
  title: string
  position: string
  date: string
  company: { name: string, url?: string }
  summary: string
  highlights: string[]
  stack: string[]
  themes: { title: string, paragraphs: string[] }[]
}

export interface LlmsInput {
  siteUrl: string
  projects: LlmsProject[]
  experience: LlmsExperience[]
  meetingUrl: string
  linkedinUrl: string
  githubUrl: string
}

const HEADER = [
  '# Gabriel Oliveira',
  '',
  '> Fullstack & Back-End Developer. Builds reliable, maintainable, and impactful digital solutions, focused on clarity, collaborative problem-solving, and well-structured software.',
  '',
  'Available in English (default), Portuguese (/pt) and Spanish (/es).',
  ''
]

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0] ?? text

/** Plain Markdown summary of the site for LLM crawlers (served at `/llms.txt`). */
export function buildLlmsTxt(input: LlmsInput): string {
  const { siteUrl } = input

  return [
    ...HEADER,
    '## Pages',
    '',
    `- [Home](${siteUrl}/): introduction, work experience and technologies`,
    `- [About](${siteUrl}/about): background and interests`,
    `- [Projects](${siteUrl}/projects): selected projects with stack and links`,
    `- [Books](${siteUrl}/books): recommended software engineering books`,
    `- [Blog](${siteUrl}/blog): articles on software engineering, cloud and Vue, published on Arandu`,
    `- [Full content](${siteUrl}/llms-full.txt): full text of each work experience case study`,
    `- [Portuguese version](${siteUrl}/pt)`,
    `- [Spanish version](${siteUrl}/es)`,
    '',
    '## Projects',
    '',
    ...input.projects.map((project) => {
      const stack = project.tags.length ? ` Stack: ${project.tags.join(', ')}.` : ''
      return `- [${project.title}](${project.url}): ${firstSentence(project.description)}${stack}`
    }),
    '',
    '## Experience',
    '',
    ...input.experience.map((item) => {
      const company = item.company.url ? `[${item.company.name}](${item.company.url})` : item.company.name
      const details = item.slug
        ? ` ([details](${siteUrl}/experience/${item.slug}), [pt](${siteUrl}/pt/experience/${item.slug}), [es](${siteUrl}/es/experience/${item.slug}))`
        : ''
      return `- ${item.position} ${company}, ${item.date}${details}`
    }),
    '',
    '## Contact',
    '',
    `- [Book a call](${input.meetingUrl})`,
    `- [LinkedIn](${input.linkedinUrl})`,
    '',
    '## Profiles',
    '',
    `- [LinkedIn](${input.linkedinUrl})`,
    `- [GitHub](${input.githubUrl})`,
    ''
  ].join('\n')
}

/** Full text of every case study (served at `/llms-full.txt`), for LLMs that want the content without crawling. */
export function buildLlmsFullTxt(input: { siteUrl: string, cases: LlmsCase[] }): string {
  const { siteUrl } = input

  return [
    ...HEADER,
    '## Work experience case studies',
    '',
    ...input.cases.flatMap((item) => {
      const company = item.company.url ? `[${item.company.name}](${item.company.url})` : item.company.name
      return [
        `### ${item.title}`,
        '',
        `${item.position} ${company}, ${item.date}`,
        `URL: ${siteUrl}/experience/${item.slug}`,
        ...(item.stack.length ? [`Stack: ${item.stack.join(', ')}.`] : []),
        '',
        item.summary,
        '',
        ...item.highlights.map(highlight => `- ${highlight}`),
        ...(item.highlights.length ? [''] : []),
        ...item.themes.flatMap(theme => [`#### ${theme.title}`, '', ...theme.paragraphs.flatMap(p => [p, ''])])
      ]
    })
  ].join('\n')
}
