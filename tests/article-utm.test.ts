import { describe, expect, it } from 'vitest'
import { canonicalArticleUrl, withShareUtm } from '../shared/utils/article-utm'

const base = 'https://dwcorp.com.br/arandu/br/artigo/introducao-a-cli'

describe('withShareUtm', () => {
  it('adds the share params to an article link', () => {
    expect(withShareUtm(base)).toBe(
      `${base}?utm_source=whatsapp&utm_medium=social&utm_campaign=article-share`
    )
  })

  it('is idempotent, so applying it twice does not duplicate params', () => {
    const once = withShareUtm(base)
    expect(withShareUtm(once)).toBe(once)
  })

  it('keeps existing query params and overrides only the utm ones', () => {
    expect(withShareUtm(`${base}?ref=home&utm_source=old`)).toBe(
      `${base}?ref=home&utm_source=whatsapp&utm_medium=social&utm_campaign=article-share`
    )
  })
})

describe('canonicalArticleUrl', () => {
  it('removes the share params without leaving a dangling "?"', () => {
    expect(canonicalArticleUrl(withShareUtm(base))).toBe(base)
  })

  it('keeps other params, including utm params it did not add', () => {
    expect(canonicalArticleUrl(`${base}?ref=home&utm_term=x&utm_source=whatsapp`)).toBe(
      `${base}?ref=home&utm_term=x`
    )
  })

  it('returns URLs without a query, and invalid input, unchanged', () => {
    expect(canonicalArticleUrl(base)).toBe(base)
    expect(canonicalArticleUrl('not a url')).toBe('not a url')
  })
})
