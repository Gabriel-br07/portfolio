import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards for the case-study content (content/{,pt/,es/}experience/*.yml and the `experience` block of
 * content/{,pt/,es/}index.yml). Plain text checks, so no YAML parser is needed. The CV profile marks
 * some facts as unverified/incomplete; they must never reach the public site.
 */
const ROOT = process.cwd()
const DIRS = ['content/experience', 'content/pt/experience', 'content/es/experience']
const INDEXES = ['content/index.yml', 'content/pt/index.yml', 'content/es/index.yml']

const slugsIn = (dir: string) => readdirSync(join(ROOT, dir)).filter(f => f.endsWith('.yml')).map(f => f.replace(/\.yml$/, '')).sort()
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')

// Unverified / incomplete / confidential facts (see ~/git/CV/profile/evidence.yaml).
// "cobrança" alone is fine (Stripe charging); the unfinished Oby collections workflow is not.
const FORBIDDEN = [
  /10\s*[-–]\s*14/, // "10-14 clicks" report improvement (unverified)
  /70\s*%/, // simulated review-time reduction (not measured)
  /fluxo de cobran[cç]a|gest[aã]o de cobran[cç]a|recupera[cç][aã]o financeira|negocia[cç][aã]o de pagamentos/i,
  /collections? (management|workflow)|financial recovery|payment negotiation/i,
  /recuperaci[oó]n financiera|gesti[oó]n de cobranza|negociaci[oó]n de pagos/i,
  /\b3 escolas\b|\b90 alunos\b|\b3 schools\b|\b90 students\b|\b3 escuelas\b|\b90 alumnos\b/i
]

describe('experience content', () => {
  it('has the same slugs in every locale', () => {
    const [en, pt, es] = DIRS.map(slugsIn)
    expect(en!.length).toBeGreaterThan(0)
    expect(pt).toEqual(en)
    expect(es).toEqual(en)
  })

  it('uses the file name as slug', () => {
    for (const dir of DIRS) {
      for (const slug of slugsIn(dir)) {
        expect(read(`${dir}/${slug}.yml`), `${dir}/${slug}.yml`).toMatch(new RegExp(`^slug: "${slug}"$`, 'm'))
      }
    }
  })

  it('has the same number of themes per role in every locale', () => {
    for (const slug of slugsIn(DIRS[0]!)) {
      const counts = DIRS.map(dir => (read(`${dir}/${slug}.yml`).match(/^ {2}- title:/gm) ?? []).length)
      expect(new Set(counts).size, `${slug} themes per locale: ${counts.join('/')}`).toBe(1)
    }
  })

  it('lists every slug in the index of every locale, in the same order', () => {
    const orders = INDEXES.map(path => [...read(path).matchAll(/^ {4}- slug: "([^"]+)"$/gm)].map(m => m[1]))
    expect(orders[0]!.length).toBeGreaterThan(0)
    expect(orders[1]).toEqual(orders[0])
    expect(orders[2]).toEqual(orders[0])
    expect([...orders[0]!].sort()).toEqual(slugsIn(DIRS[0]!))
  })

  it('keeps summaries, highlights and paragraphs within the answer-engine limits', () => {
    for (const path of INDEXES) {
      for (const m of read(path).matchAll(/^ {6}summary: "(.*)"$/gm)) expect(m[1]!.length, path).toBeLessThanOrEqual(320)
      for (const m of read(path).matchAll(/^ {8}- "(.*)"$/gm)) expect(m[1]!.length, path).toBeLessThanOrEqual(120)
    }
    for (const dir of DIRS) {
      for (const slug of slugsIn(dir)) {
        const text = read(`${dir}/${slug}.yml`)
        for (const m of text.matchAll(/^ {6}- "(.*)"$/gm)) expect(m[1]!.length, `${dir}/${slug}`).toBeLessThanOrEqual(320)
        expect((text.match(/^description: "(.*)"$/m) ?? [])[1]!.length, `${dir}/${slug} description`).toBeLessThanOrEqual(165)
      }
    }
  })

  it('never mentions unverified, incomplete or confidential facts', () => {
    const files = [
      ...INDEXES.map(p => join(ROOT, p)),
      ...DIRS.flatMap(dir => slugsIn(dir).map(slug => join(ROOT, dir, `${slug}.yml`)))
    ]
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      // Only the experience block of the index files is relevant.
      const scope = file.endsWith('index.yml') ? (text.split(/^experience:/m)[1] ?? '').split(/^\S/m)[0] ?? '' : text
      for (const pattern of FORBIDDEN) expect(scope, `${file} matches ${pattern}`).not.toMatch(pattern)
    }
  })
})
