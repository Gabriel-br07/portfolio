/**
 * Single-string typed.js: full text with `^ms` pauses and `\n\n` between paragraphs (typed.js syntax).
 * Dynamic import keeps typed.js off the SSR graph.
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** typed.js: ms per character — lower = faster. */
const SPEED_BOOST = 0.52

function fasterTypeBackDelay(ms: number): number {
  return Math.max(1, Math.round(ms * SPEED_BOOST))
}

function injectPauses(singleParagraph: string, chunkWords: number): string {
  const line = singleParagraph.replace(/\s+/g, ' ').trim()
  const w = line.split(' ').filter((x) => x.length > 0)
  if (w.length <= 1) return line
  const pieces: string[] = []
  for (let i = 0; i < w.length; i += chunkWords) {
    pieces.push(w.slice(i, Math.min(i + chunkWords, w.length)).join(' '))
  }
  return pieces
    .map((p, idx) => (idx === 0 ? p : ` ^${randomInt(120, 320)} ${p}`))
    .join('')
}

/** One block: word-chunk pauses; multiple blocks: `^ms` then `\n\n` between paragraphs. */
function injectPausesMultiline(original: string, chunkWords: number): string {
  const trimmed = original.trim()
  const blocks = trimmed.split(/\n\s*\n/)
  if (blocks.length === 1) return injectPauses(blocks[0] ?? '', chunkWords)
  return blocks
    .map((b) => injectPauses(b.replace(/\s+/g, ' ').trim(), chunkWords))
    .join(` ^${randomInt(140, 340)} \n\n`)
}

function buildSingleTypedString(finalText: string): string {
  const trimmed = finalText.trim()
  if (!trimmed) return ''
  return injectPausesMultiline(trimmed, randomInt(4, 7))
}

export function useTypedHumanized(
  targetRef: Ref<HTMLElement | null>,
  finalText: MaybeRefOrGetter<string>
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

    const text = toValue(finalText).trim()
    if (!text) return

    const single = buildSingleTypedString(text)
    if (!single) return

    const typeSpeed = fasterTypeBackDelay(randomInt(18, 38))
    const backSpeed = fasterTypeBackDelay(randomInt(10, 24))
    const backDelay = randomInt(140, 360)

    const { default: TypedCtor } = await import('typed.js')

    instance = new TypedCtor(el, {
      strings: [single],
      typeSpeed,
      backSpeed,
      backDelay,
      smartBackspace: true,
      loop: false,
      showCursor: true,
      contentType: 'null'
    })
  }

  onBeforeUnmount(stop)

  return { start, stop }
}
