export interface ExperienceCompany {
  name: string
  logo: string
  url?: string
  color?: string
}

export interface ExperienceItem {
  date: string
  position: string
  company?: ExperienceCompany
}
