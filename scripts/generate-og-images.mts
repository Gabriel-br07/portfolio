// Regenerates the share (Open Graph / Twitter) images: `pnpm generate:og`.
// Needs a Chromium-based browser (CHROME_PATH, or google-chrome / chromium / brave-browser in PATH) and
// internet access for the Public Sans font. Output: public/images/seo/og-home.png and og-<slug>.png (1200x630).
// Runs on plain Node (type stripping): keep this file free of TS-only syntax such as enums.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { DARK_LOGO_VARIANTS } from '../app/utils/experienceLogos.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT_DIR = join(ROOT, 'public/images/seo')
const WIDTH = 1200
const HEIGHT = 630
const MAX_BYTES = 300 * 1024
const NAME = 'Gabriel Faria'
const DOMAIN = new URL(process.env.NUXT_PUBLIC_SITE_URL || 'https://gabrielfaria.dev.br').host

function fail(message: string): never {
  console.error(`[generate-og] ${message}`)
  process.exit(1)
}

function findChrome(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  for (const name of ['google-chrome', 'chromium', 'brave-browser']) {
    const found = spawnSync('which', [name], { encoding: 'utf8' })
    if (found.status === 0) return found.stdout.trim()
  }
  return fail('No Chromium-based browser found. Set CHROME_PATH (e.g. CHROME_PATH=/usr/bin/brave-browser).')
}

function read(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8')
}

function match(text: string, re: RegExp, what: string): string {
  const value = re.exec(text)?.[1]
  return value ?? fail(`Could not find ${what}`)
}

function dataUri(path: string): string {
  const mime = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.webp') ? 'image/webp' : 'image/png'
  return `data:${mime};base64,${readFileSync(join(ROOT, 'public', path)).toString('base64')}`
}

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

interface Card {
  id: string
  html: string
}

const avatar = dataUri('/images/profile/avatar.webp')

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@500;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; background: #020618; color: #f8fafc;
    font-family: 'Public Sans', sans-serif; position: relative; overflow: hidden; }
  .glow { position: absolute; inset: 0; background: radial-gradient(circle at 85% 15%, #1e293b, transparent 55%); }
  .muted { color: #64748b; }
`

function homeCard(role: string): Card {
  return {
    id: 'home',
    html: `<style>${BASE_CSS}
      .wrap { position: relative; display: flex; align-items: center; gap: 72px; height: 100%; padding: 0 96px; }
      .photo { width: 240px; height: 240px; border-radius: 50%; border: 4px solid #334155; object-fit: cover; flex: none; }
      h1 { margin: 0; font-size: 96px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
      .role { margin-top: 20px; font-size: 40px; font-weight: 500; color: #94a3b8; }
      .domain { position: absolute; left: 96px; bottom: 56px; font-size: 30px; font-weight: 500; }
    </style>
    <div class="glow"></div>
    <div class="wrap">
      <img class="photo" src="${avatar}" alt="">
      <div><h1>${NAME}</h1><div class="role">${escapeHtml(role)}</div></div>
      <div class="domain muted">${DOMAIN}</div>
    </div>`
  }
}

function caseCard(slug: string, title: string, logo: string, accent: string): Card {
  const darkVariant = DARK_LOGO_VARIANTS[logo]
  // A logo without a dark-theme variant (dark artwork) sits on a light badge so it stays readable.
  const logoHtml = `<img class="logo${darkVariant ? '' : ' badge'}" src="${dataUri(darkVariant ?? logo)}" alt="">`
  return {
    id: slug,
    html: `<style>${BASE_CSS}
      .bar { position: absolute; top: 0; left: 0; right: 0; height: 12px; background: ${accent}; }
      .wrap { position: relative; height: 100%; padding: 72px 96px 56px; display: flex; flex-direction: column; justify-content: space-between; }
      .logo { height: 64px; width: auto; max-width: 320px; object-fit: contain; object-position: left; align-self: flex-start; }
      .logo.badge { box-sizing: content-box; height: 56px; padding: 14px 24px; background: #f8fafc; border-radius: 16px; }
      h1 { margin: 0; font-size: 72px; font-weight: 800; line-height: 1.08; letter-spacing: -1px; max-width: 980px;
        text-wrap: balance; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .foot { display: flex; align-items: center; justify-content: space-between; }
      .who { display: flex; align-items: center; gap: 20px; font-size: 30px; font-weight: 700; }
      .who img { width: 56px; height: 56px; border-radius: 50%; border: 3px solid #334155; object-fit: cover; }
      .domain { font-size: 28px; font-weight: 500; }
    </style>
    <div class="glow"></div><div class="bar"></div>
    <div class="wrap">
      ${logoHtml}
      <h1>${escapeHtml(title)}</h1>
      <div class="foot"><div class="who"><img src="${avatar}" alt="">${NAME}</div><div class="domain muted">${DOMAIN}</div></div>
    </div>`
  }
}

function buildCards(): Card[] {
  const index = read('content/index.yml')
  const role = match(index, /^ {2}title: "(.+)"/m, 'seo.title in content/index.yml')
  const experience = index.slice(index.indexOf('\nexperience:'))
  const cards = [homeCard(role)]
  for (const block of experience.split(/^ {4}- slug: /m).slice(1)) {
    const slug = match(block, /^"([^"]+)"/, 'experience slug')
    const logo = match(block, /^ {8}logo: "([^"]+)"/m, `logo of ${slug}`)
    const accent = match(block, /^ {8}colorDark: "(#[0-9a-fA-F]{6})"/m, `colorDark of ${slug}`)
    const title = match(read(`content/experience/${slug}.yml`), /^title: "(.+)"/m, `title of ${slug}`)
    cards.push(caseCard(slug, title, logo, accent))
  }
  return cards
}

const chrome = findChrome()
const workDir = mkdtempSync(join(tmpdir(), 'og-'))

try {
  for (const card of buildCards()) {
    const htmlPath = join(workDir, `${card.id}.html`)
    const shotPath = join(workDir, `${card.id}.png`)
    writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"></head><body>${card.html}</body></html>`)

    const run = spawnSync(chrome, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      `--window-size=${WIDTH},${HEIGHT}`, '--virtual-time-budget=10000', `--screenshot=${shotPath}`, `file://${htmlPath}`
    ], { encoding: 'utf8' })
    if (run.status !== 0) fail(`${chrome} failed for ${card.id}: ${run.stderr}`)

    const target = join(OUT_DIR, `og-${card.id}.png`)
    // The screenshot may be a few px off in headless mode: crop/extend to the exact size, then palette-compress.
    await sharp(shotPath)
      .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
      .png({ palette: true, quality: 90, compressionLevel: 9 })
      .toFile(target)

    const { width, height, size } = await sharp(target).metadata()
    const bytes = readFileSync(target).length
    if (width !== WIDTH || height !== HEIGHT) fail(`${target} is ${width}x${height}, expected ${WIDTH}x${HEIGHT}`)
    if (bytes > MAX_BYTES) fail(`${target} is ${Math.round(bytes / 1024)} KB, expected <= ${MAX_BYTES / 1024} KB`)
    console.log(`[generate-og] ${target} ${width}x${height} ${Math.round((size ?? bytes) / 1024)} KB`)
  }
} finally {
  rmSync(workDir, { recursive: true, force: true })
}
