import type { Article, ArticleLocale } from '../../shared/types/article'
import en from '../assets/articles/en.json'
import pt from '../assets/articles/pt.json'
import es from '../assets/articles/es.json'
import { withShareUtm } from '../../shared/utils/article-utm'

// Committed copies predate the UTM params, so they are added here too (same as the live feed).
const withUtm = (articles: Article[]): Article[] =>
  articles.map(article => ({ ...article, url: withShareUtm(article.url) }))

export const articlesSnapshot: Record<ArticleLocale, Article[]> = {
  en: withUtm(en),
  pt: withUtm(pt),
  es: withUtm(es)
}
