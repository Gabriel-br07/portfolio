/**
 * Shared mascot layer state (canonical `useState` pattern, see `useContactModal`).
 * `active` starts `true` on server and client so SSR markup never diverges; the
 * persisted preference is restored from localStorage only after mount.
 */
export function useMascots() {
  const active = useState('mascots-active', () => true)
  const restored = useState('mascots-restored', () => false)
  const reducedMotion = usePreferredReducedMotion()

  /** Idempotent, client-only restore of the persisted preference. */
  function restore() {
    if (restored.value || import.meta.server)
      return
    restored.value = true
    try {
      const stored = window.localStorage.getItem('mascots-active')
      if (stored !== null)
        active.value = stored === '1'
    } catch {
      // localStorage unavailable (private mode / blocked) — keep default.
    }
  }

  function setActive(value: boolean) {
    active.value = value
    if (import.meta.client) {
      try {
        window.localStorage.setItem('mascots-active', value ? '1' : '0')
      } catch {
        // Ignore persistence failures — the toggle still works for the session.
      }
    }
  }

  return { active, reducedMotion, restore, setActive }
}
