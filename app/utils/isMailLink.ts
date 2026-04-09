/** Footer/social link entries that should open the contact modal instead of mailto. */
export function isMailLink(link: { to?: string, icon?: string }) {
  const to = String(link.to ?? '')
  const icon = String(link.icon ?? '')
  return icon.includes('lucide-mail') || to.startsWith('mailto:')
}
