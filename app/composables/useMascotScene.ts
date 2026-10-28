/** Route scenes that can show a mascot. `MascotWorld` keys its scene specs by these. */
export const MASCOT_SCENE_KEYS = ['home', 'books', 'projects', 'blog'] as const

export type MascotSceneKey = typeof MASCOT_SCENE_KEYS[number]

export function isMascotSceneKey(key: string): key is MascotSceneKey {
  return (MASCOT_SCENE_KEYS as readonly string[]).includes(key)
}

/** Route path → scene key, with the i18n prefix (/pt, /es) stripped. */
export function sceneKeyFor(path: string): string {
  const stripped = path.replace(/^\/(?:pt|es)(?=\/|$)/, '')
  return stripped.replace(/^\//, '').replace(/\/$/, '') || 'home'
}

/**
 * Whether the mascot layer should be mounted. Sticky once true, so client-side
 * navigation to a page without a scene does not tear down a walk in progress.
 * The home greeter only plays at >= 1024px, so the layer is skipped there on phones.
 */
export function useMascotLayer() {
  const route = useRoute()
  const wideViewport = useMediaQuery('(min-width: 1024px)')
  const mounted = ref(false)

  const hasScene = computed(() => {
    const key = sceneKeyFor(route.path)
    if (!isMascotSceneKey(key))
      return false
    return key !== 'home' || wideViewport.value
  })

  watch(hasScene, (value) => {
    if (value)
      mounted.value = true
  }, { immediate: true })

  return { mounted }
}
