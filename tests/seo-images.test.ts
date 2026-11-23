import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SEO_DIR = join(ROOT, 'public/images/seo')
const MAX_BYTES = 300 * 1024
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

const slugs = readdirSync(join(ROOT, 'content/experience'))
  .filter(f => f.endsWith('.yml'))
  .map(f => f.replace(/\.yml$/, ''))

describe('share images (public/images/seo)', () => {
  it('has at least one case study', () => {
    expect(slugs.length).toBeGreaterThan(0)
  })

  for (const id of ['home', ...slugs]) {
    const file = join(SEO_DIR, `og-${id}.png`)

    it(`og-${id}.png exists, is a 1200x630 PNG and at most 300 KB`, () => {
      expect(existsSync(file), `${file} is missing: run pnpm generate:og`).toBe(true)
      const bytes = readFileSync(file)
      expect(bytes.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true)
      expect(bytes.readUInt32BE(16)).toBe(1200) // IHDR width
      expect(bytes.readUInt32BE(20)).toBe(630) // IHDR height
      expect(statSync(file).size).toBeLessThanOrEqual(MAX_BYTES)
    })
  }
})
