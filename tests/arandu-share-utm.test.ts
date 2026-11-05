import { describe, expect, it } from 'vitest'
import { withShareUtm } from '../server/utils/arandu'

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
