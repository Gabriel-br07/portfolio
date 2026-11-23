/** Size of the share images in public/images/seo (see scripts/generate-og-images.mts). */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** Absolute URL of a site-relative share image path (`/images/seo/og-oby.png`); OG/Twitter need absolute URLs. */
export function resolveOgImage(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
