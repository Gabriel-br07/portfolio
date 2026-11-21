import { describe, expect, it } from 'vitest'
import { buildLlmsTxt } from '../server/utils/llms'

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

  it('renders experience from content and a contact section', () => {
    const text = buildLlmsTxt({ ...base, projects: [] })
    expect(text).toContain('- Software Developer at [Acme](https://acme.test), Jul 2026 − Present')
    expect(text).toContain('## Contact\n\n- [Book a call](https://cal.test/me)\n- [LinkedIn](https://linkedin.test/in/me)')
  })
})
