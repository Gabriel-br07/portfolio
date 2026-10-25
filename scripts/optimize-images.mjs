// One-off asset optimisation (run: node scripts/optimize-images.mjs).
// Sizes are 2x the displayed size to stay sharp on high-DPI screens.
import sharp from 'sharp'

const jobs = [
  { src: 'public/images/profile/avatar.jpeg', out: 'public/images/profile/avatar.webp', resize: { width: 320, height: 320, fit: 'cover' }, quality: 82 },
  { src: 'public/icons/tech/rust-ferris.png', out: 'public/icons/tech/rust-ferris.webp', resize: { width: 144, height: 96, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }, quality: 90 },
  { src: 'public/logos/DW-Corp-logo-white-transparent.png', out: 'public/logos/DW-Corp-logo-white-transparent.webp', resize: { width: 256 }, quality: 90 }
]

for (const { src, out, resize, quality } of jobs) {
  const info = await sharp(src).resize(resize).webp({ quality }).toFile(out)
  console.log(out, `${info.width}x${info.height}`, info.size, 'bytes')
}
