export type ArticleLocale = 'en' | 'pt' | 'es'

export interface Article {
  id: string
  title: string
  url: string
  excerpt: string
  cover: string | null
  publishedAt: string
  categories: string[]
}
