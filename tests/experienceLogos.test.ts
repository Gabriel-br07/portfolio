import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DARK_LOGO_VARIANTS, DEFAULT_LOGO_SIZE, LOGO_SIZES, sizeOfLogo } from '../app/utils/experienceLogos'

const ROOT = process.cwd()
const INDEXES = ['content/index.yml', 'content/pt/index.yml', 'content/es/index.yml']

/** `logo: "/logos/x"` values of the experience companies, across locales. */
function contentLogos(): string[] {
  return INDEXES.flatMap(path =>
    [...readFileSync(join(ROOT, path), 'utf8').matchAll(/^\s+logo: "(\/[^"]+)"/gm)].map(m => m[1]!)
  )
}

describe('experience logos', () => {
  it('every logo file referenced in the maps exists in public/', () => {
    const files = [...Object.keys(LOGO_SIZES), ...Object.keys(DARK_LOGO_VARIANTS), ...Object.values(DARK_LOGO_VARIANTS)]
    for (const file of files) expect(existsSync(join(ROOT, 'public', file)), file).toBe(true)
  })

  it('every logo used in content has an explicit size', () => {
    const logos = contentLogos()
    expect(logos.length).toBeGreaterThan(0)
    for (const logo of logos) expect(LOGO_SIZES[logo], `size for ${logo}`).toBeDefined()
  })

  it('every dark variant has a size too', () => {
    for (const dark of Object.values(DARK_LOGO_VARIANTS)) expect(LOGO_SIZES[dark], dark).toBeDefined()
  })

  it('falls back to a default size for an unknown logo', () => {
    expect(sizeOfLogo('/logos/unknown.svg')).toEqual(DEFAULT_LOGO_SIZE)
    expect(sizeOfLogo('/logos/serpro.svg')).toEqual([270, 73])
  })
})
