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

/** Case-study data for one role: short item from `index`, long detail from `experiences`, plus neighbours. */
export interface ExperienceCase {
  item: ExperienceItem
  detail: ExperienceCaseDetail
  newer: ExperienceItem | null
  older: ExperienceItem | null
}
