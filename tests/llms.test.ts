import { describe, expect, it } from 'vitest'
import { buildLlmsFullTxt, buildLlmsTxt, isEnglishStem, pickCases } from '../server/utils/llms'

const base = {
  siteUrl: 'https://example.test',
  experience: [{ position: 'Software Developer at', date: 'Jul 2026 − Present', company: { name: 'Acme', url: 'https://acme.test' } }],
  meetingUrl: 'https://cal.test/me',
  linkedinUrl: 'https://linkedin.test/in/me',
  githubUrl: 'https://github.test/me'
}

describe('buildLlmsTxt', () => {
  it('omits the stack when a project has no tags', () => {
    const text = buildLlmsTxt({ ...base, projects: [{ title: 'Empty', description: 'Does things. More.', url: 'https://p.test', tags: [] }] })
    expect(text).toContain('- [Empty](https://p.test): Does things.')
    expect(text).not.toContain('Stack:')
  })

  it('lists the stack when tags exist', () => {
    const text = buildLlmsTxt({ ...base, projects: [{ title: 'P', description: 'Does things.', url: 'https://p.test', tags: ['Rust', 'Axum'] }] })
    expect(text).toContain('Stack: Rust, Axum.')
  })

  it('links each experience to its case-study page when it has a slug', () => {
    const text = buildLlmsTxt({
      ...base,
      projects: [],
      experience: [{ slug: 'acme', position: 'Software Developer at', date: 'Jul 2026 − Present', company: { name: 'Acme', url: 'https://acme.test' } }]
    })
    expect(text).toContain('- Software Developer at [Acme](https://acme.test), Jul 2026 − Present ([details](https://example.test/experience/acme), [pt](https://example.test/pt/experience/acme), [es](https://example.test/es/experience/acme))')
  })

  it('renders experience from content and a contact section', () => {
    const text = buildLlmsTxt({ ...base, projects: [] })
    expect(text).toContain('- Software Developer at [Acme](https://acme.test), Jul 2026 − Present')
    expect(text).toContain('## Contact\n\n- [Book a call](https://cal.test/me)\n- [LinkedIn](https://linkedin.test/in/me)')
  })
})

describe('buildLlmsFullTxt', () => {
  const full = {
    slug: 'acme',
    title: 'Software Developer at Acme',
    position: 'Software Developer at',
    date: 'Jul 2026 − Present',
    company: { name: 'Acme', url: 'https://acme.test' },
    summary: 'Built things.',
    highlights: ['Shipped X'],
    stack: ['Rust', 'Axum'],
    themes: [{ title: 'Reliability', paragraphs: ['Used retries.'] }]
  }

  it('renders each case with its URL, stack, highlights and themes', () => {
    const text = buildLlmsFullTxt({ siteUrl: 'https://example.test', cases: [full] })
    expect(text).toContain('### Software Developer at Acme')
    expect(text).toContain('URL: https://example.test/experience/acme')
    expect(text).toContain('Stack: Rust, Axum.')
    expect(text).toContain('- Shipped X')
    expect(text).toContain('#### Reliability\n\nUsed retries.')
  })

  it('omits the stack line when there are no tags', () => {
    const text = buildLlmsFullTxt({ siteUrl: 'https://example.test', cases: [{ ...full, stack: [] }] })
    expect(text).not.toContain('Stack:')
  })
})

describe('pickCases', () => {
  const home = (slug?: string) => ({
    slug,
    position: 'Dev at',
    date: '2026',
    company: { name: slug ?? 'x' },
    summary: 's',
    highlights: ['h'],
    stack: ['A']
  })
  const detail = (slug: string, stem?: string) => ({ stem, slug, title: `T ${slug}`, themes: [{ title: 'th', paragraphs: ['p'] }] })

  it('keeps the order of the home timeline, not the order of the details', () => {
    const result = pickCases([detail('b', 'experience/b'), detail('a', 'experience/a')], [home('a'), home('b')])
    expect(result.map(c => c.slug)).toEqual(['a', 'b'])
  })

  it('joins title and themes from the detail with the rest from the home item', () => {
    const [first] = pickCases([detail('a', 'experience/a')], [home('a')])
    expect(first).toMatchObject({ slug: 'a', title: 'T a', position: 'Dev at', stack: ['A'] })
    expect(first!.themes).toHaveLength(1)
  })

  it('ignores pt and es details even when they share the slug', () => {
    const result = pickCases([detail('a', 'pt/experience/a'), detail('a', 'es/experience/a')], [home('a')])
    expect(result).toEqual([])
  })

  it('prefers the English detail when all locales exist', () => {
    const result = pickCases([detail('a', 'pt/experience/a'), { ...detail('a', 'experience/a'), title: 'English' }], [home('a')])
    expect(result[0]!.title).toBe('English')
  })

  it('skips home items without a slug', () => {
    expect(pickCases([detail('a', 'experience/a')], [home(undefined)])).toEqual([])
  })

  it('skips home items without a detail', () => {
    expect(pickCases([detail('a', 'experience/a')], [home('a'), home('missing')]).map(c => c.slug)).toEqual(['a'])
  })

  it('discards details without a stem (the locale cannot be known)', () => {
    expect(pickCases([detail('a')], [home('a')])).toEqual([])
  })

  it('discards details without themes', () => {
    const broken = { stem: 'experience/a', slug: 'a', title: 't' } as unknown as Parameters<typeof pickCases>[0][number]
    expect(pickCases([broken], [home('a')])).toEqual([])
  })
})

describe('isEnglishStem', () => {
  it('accepts only default-locale experience stems', () => {
    expect(isEnglishStem('experience/oby')).toBe(true)
    expect(isEnglishStem('pt/experience/oby')).toBe(false)
    expect(isEnglishStem('es/experience/oby')).toBe(false)
    expect(isEnglishStem(undefined)).toBe(false)
    expect(isEnglishStem('')).toBe(false)
  })
})
