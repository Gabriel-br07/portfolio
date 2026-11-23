import { describe, expect, it } from 'vitest'
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, resolveOgImage } from '../app/utils/seo'

describe('resolveOgImage', () => {
  it('joins the site URL and a site-relative path', () => {
    expect(resolveOgImage('https://x.test', '/images/seo/og-oby.png')).toBe('https://x.test/images/seo/og-oby.png')
  })

  it('does not double or drop slashes', () => {
    expect(resolveOgImage('https://x.test/', 'images/seo/og-oby.png')).toBe('https://x.test/images/seo/og-oby.png')
    expect(resolveOgImage('https://x.test//', '//images/a.png')).toBe('https://x.test/images/a.png')
  })
})

describe('share image size', () => {
  it('matches the generated cards (1200x630)', () => {
    expect([OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT]).toEqual([1200, 630])
  })
})
