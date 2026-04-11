import type { NavigationMenuItem } from '@nuxt/ui'

export function useNavLinks(): ComputedRef<NavigationMenuItem[]> {
  const { t } = useI18n()
  const localePath = useLocalePath()

  return computed(() => [
    {
      label: t('nav.home'),
      icon: 'i-lucide-home',
      to: localePath('/')
    },
    {
      label: t('nav.projects'),
      icon: 'i-lucide-folder',
      to: localePath('/projects')
    },
    {
      label: t('nav.blog'),
      icon: 'i-lucide-file-text',
      to: localePath('/blog')
    },
    {
      label: t('nav.books'),
      icon: 'i-lucide-book-open',
      to: localePath('/livros')
    },
    {
      label: t('nav.about'),
      icon: 'i-lucide-user',
      to: localePath('/about')
    }
  ])
}
