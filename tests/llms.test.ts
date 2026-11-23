import { describe, expect, it } from 'vitest'
import { buildLlmsFullTxt, buildLlmsTxt } from '../server/utils/llms'

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
