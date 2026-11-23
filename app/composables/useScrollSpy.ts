import type { MaybeRefOrGetter } from 'vue'

/** Reading progress of a list of sections (by element id) against the window scroll. */
export function useScrollSpy(ids: MaybeRefOrGetter<string[]>, probeRatio = 0.35) {
  const state = reactive<{ active: number, segments: number[], overall: number }>({
    active: 0,
    segments: [],
    overall: 0
  })
  let frame = 0
  let alive = true

  function measure() {
    const tops = toValue(ids).map((id) => {
      const el = document.getElementById(id)
      return el ? el.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY
    })
    const max = document.documentElement.scrollHeight - window.innerHeight
    const atBottom = max <= 0 || window.scrollY >= max - 2
    Object.assign(
      state,
      railProgress(tops, window.scrollY + window.innerHeight * probeRatio, atBottom),
      { overall: scrollOverall(window.scrollY, document.documentElement.scrollHeight, window.innerHeight) }
    )
  }

  function schedule() {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Web fonts and images can change the height of the sections after mount.
    document.fonts?.ready.then(() => alive && schedule())
  })

  onBeforeUnmount(() => {
    alive = false
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
  })

  return state
}
