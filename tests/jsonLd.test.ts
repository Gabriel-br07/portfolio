import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from '../app/utils/jsonLd'

describe('serializeJsonLd', () => {
  it('produces the same JSON as JSON.stringify for plain data', () => {
    const data = { '@type': 'Person', 'name': 'Gabriel', 'sameAs': ['https://a.test'] }
    expect(serializeJsonLd(data)).toBe(JSON.stringify(data))
  })

  it('escapes </script> and <!-- so they cannot break out of the tag', () => {
    const out = serializeJsonLd({ a: '</script><script>alert(1)</script>', b: '<!-- x' })
    expect(out).not.toContain('<')
    expect(out).toContain('\\u003c/script>')
  })

  it('round-trips through JSON.parse', () => {
    const data = { a: '</script>', b: ['<!--', 1, null] }
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })
})
