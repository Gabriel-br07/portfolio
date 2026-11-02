import { describe, expect, it } from 'vitest'
import type { Article } from '../shared/types/article'
import { latestArticles, sortArticles, splitFeatured } from '../app/utils/articles'

const make = (id: string, publishedAt: string): Article => ({
  id, title: id, url: `https://example.com/${id}`, excerpt: '', cover: null, publishedAt, categories: []
})

const a = make('a', '2026-01-01T00:00:00Z')
const b = make('b', '2026-03-01T00:00:00Z')
const c = make('c', '2026-02-01T00:00:00Z')
const d = make('d', '2026-04-01T00:00:00Z')

describe('sortArticles', () => {
  it('orders newest first without mutating input', () => {
    const input = [a, b, c]
    expect(sortArticles(input).map(x => x.id)).toEqual(['b', 'c', 'a'])
    expect(input.map(x => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('drops articles with invalid dates', () => {
    expect(sortArticles([a, make('bad', 'nope')]).map(x => x.id)).toEqual(['a'])
  })
})

describe('splitFeatured', () => {
  it('handles zero articles', () => {
    expect(splitFeatured([])).toEqual({ featured: null, rest: [] })
  })

  it('handles one article', () => {
    expect(splitFeatured([a])).toEqual({ featured: a, rest: [] })
  })

  it('features the newest article', () => {
    const { featured, rest } = splitFeatured([a, d, b, c])
    expect(featured?.id).toBe('d')
    expect(rest.map(x => x.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('latestArticles', () => {
  it('returns [] for no articles', () => {
    expect(latestArticles([])).toEqual([])
  })

  it('returns all when fewer than three', () => {
    expect(latestArticles([a, b]).map(x => x.id)).toEqual(['b', 'a'])
  })

  it('caps at three, newest first', () => {
    expect(latestArticles([a, b, c, d]).map(x => x.id)).toEqual(['d', 'b', 'c'])
  })
})
