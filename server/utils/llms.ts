export interface LlmsProject {
  title: string
  description: string
  url: string
  tags: string[]
}

export interface LlmsExperience {
  position: string
  date: string
  company: { name: string, url?: string }
}

export interface LlmsInput {
  siteUrl: string
  projects: LlmsProject[]
  experience: LlmsExperience[]
  meetingUrl: string
  linkedinUrl: string
  githubUrl: string
}

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0] ?? text

/** Plain Markdown summary of the site for LLM crawlers (served at `/llms.txt`). */
export function buildLlmsTxt(input: LlmsInput): string {
  const { siteUrl } = input

  return [
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
    `- [Blog](${siteUrl}/blog): articles on software engineering, cloud and Vue, published on Arandu`,
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
      return `- ${item.position} ${company}, ${item.date}`
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
