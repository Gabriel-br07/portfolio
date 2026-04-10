/**
 * Client-only typed.js helper: creates/destroys instances so SSR never runs the library,
 * and repeated open/close cycles stay predictable.
 * (No `import type` from typed.js — avoids pulling that package into the SSR module graph.)
 */
export function useTypedStrings(
  targetRef: Ref<HTMLElement | null>,
  getStrings: () => string[]
) {
  let instance: { destroy: () => void } | null = null

  function clearTarget() {
    const el = targetRef.value
    if (el) el.innerHTML = ''
  }

  function stop() {
    instance?.destroy()
    instance = null
    clearTarget()
  }

  async function start() {
    if (!import.meta.client) return
    stop()
    await nextTick()
    const el = targetRef.value
    if (!el) return
    const { default: TypedCtor } = await import('typed.js')
    instance = new TypedCtor(el, {
      strings: getStrings(),
      typeSpeed: 22,
      showCursor: true,
      loop: false,
      // Plain text (not HTML) for accessibility and predictable output
      contentType: 'null'
    })
  }

  onBeforeUnmount(stop)

  return { start, stop }
}
