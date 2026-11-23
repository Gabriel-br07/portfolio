export type LogoSize = [number, number]

export function sizeOfLogo(src: string): LogoSize {
  return LOGO_SIZES[src] ?? DEFAULT_LOGO_SIZE
}

/** Logos that have a dedicated dark-theme variant. */
export const DARK_LOGO_VARIANTS: Record<string, string> = {
  '/logos/DW-Corp-logo.svg': '/logos/DW-Corp-logo-white-transparent.webp',
  '/logos/oby-capital-logo.webp': '/logos/oby-capital-logo-white-transparent.webp'
}

/**
 * Intrinsic sizes of the files in public/logos (width x height). Every file is cropped to its visible artwork
 * (no transparent padding), so the same wrapper height renders all logos at a comparable size. They only give the
 * browser the aspect ratio before the image loads; the rendered height is fixed by the wrapper (h-6 sm:h-7).
 */
export const LOGO_SIZES: Record<string, LogoSize> = {
  '/logos/oby-capital-logo.webp': [256, 85],
  '/logos/oby-capital-logo-white-transparent.webp': [256, 85],
  '/logos/DW-Corp-logo.svg': [419, 104],
  '/logos/DW-Corp-logo-white-transparent.webp': [131, 33],
  '/logos/serpro.svg': [270, 73]
}

export const DEFAULT_LOGO_SIZE: LogoSize = [256, 96]
