export type TechItem = {
  key: string
  src: string
  label: string
  alt: string
  /** Near-black monochrome logo: invert in dark mode so it stays visible on the dark bg. */
  invertOnDark?: boolean
}

export type TechCarouselSlide = {
  item: TechItem
  slideKey: string
  /** Repeated copies exist only for the loop; hide them from assistive tech. */
  decorative?: boolean
}
