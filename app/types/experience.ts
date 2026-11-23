export interface ExperienceCompany {
  name: string
  logo: string
  url?: string
  color?: string
  colorDark?: string
}

export interface ExperienceItem {
  slug: string
  date: string
  position: string
  summary: string
  highlights: string[]
  stack: string[]
  company?: ExperienceCompany
}

export interface ExperienceTheme {
  title: string
  paragraphs: string[]
}

export interface ExperienceCaseDetail {
  slug: string
  title: string
  description: string
  themes: ExperienceTheme[]
}
