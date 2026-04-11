<script setup lang="ts">
import type { EmblaOptionsType } from 'embla-carousel'
import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-vue'

export type TechItem = { key: string, src: string, label: string, alt: string }
export type TechCarouselSlide = { item: TechItem, slideKey: string }

/** Must match parent `TechCarousel` — set false to silence logs. Keep logging lightweight to avoid noise. */
const CAROUSEL_DEBUG = import.meta.dev

const props = defineProps<{
  slides: readonly TechCarouselSlide[]
}>()

/**
 * `watchResize: true` (default) keeps loop + scroll math correct when layout updates.
 * `watchSlides: false` — slide list is static; avoids extra mutation observers.
 * `watchDrag: false` — ticker is not user-draggable (matches prior Swiper behavior).
 */
const emblaOptions: EmblaOptionsType = {
  loop: true,
  axis: 'x',
  align: 'start',
  skipSnaps: true,
  watchDrag: false,
  watchResize: true,
  watchSlides: false
}

/** Stable plugin instance — continuous scroll, not snap autoplay. Keep this reference stable across renders. */
const autoScrollPlugin = AutoScroll({
  direction: 'forward',
  speed: 1.25,
  startDelay: 0,
  playOnInit: true,
  stopOnMouseEnter: false,
  stopOnInteraction: false,
  stopOnFocusIn: false
})

const emblaPlugins = [autoScrollPlugin]

const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins)

watch(
  emblaApi,
  (api) => {
    if (!api)
      return

    if (CAROUSEL_DEBUG) {
      console.log('[TechCarousel] embla ready')
    }

    /** After `reInit` (resize, theme reflow, etc.) auto-scroll must be nudged — not a color-mode watcher */
    api.on('reInit', () => {
      api.plugins()?.autoScroll?.play()
    })

    api.plugins()?.autoScroll?.play()
  },
  { immediate: true }
)

const hoveredSlideKey = ref<string | null>(null)

function onTileEnter(slideKey: string) {
  hoveredSlideKey.value = slideKey
}

function onTileLeave() {
  hoveredSlideKey.value = null
}

function isActive(slideKey: string) {
  return hoveredSlideKey.value === slideKey
}

const techMediaSize = 'size-8 sm:size-9 shrink-0 object-contain'
const techMediaTransition = 'transition-[filter,opacity,transform] duration-200 ease-out'

function mediaClass(slideKey: string) {
  const active = isActive(slideKey)
  return [
    techMediaSize,
    techMediaTransition,
    active
      ? 'grayscale-0 opacity-100 scale-[1.03]'
      : 'grayscale opacity-70'
  ]
}

function tileClass(slideKey: string) {
  return [
    'flex flex-col items-center justify-center gap-1.5 px-0.5 py-1 sm:gap-2 sm:px-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-[box-shadow,background-color] duration-200',
    isActive(slideKey)
      ? 'ring-1 ring-default bg-elevated/50'
      : 'ring-0'
  ]
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-2 sm:px-1">
    <div class="tech-carousel-viewport">
      <div class="embla">
        <div
          ref="emblaRef"
          class="embla__viewport overflow-hidden [backface-visibility:hidden]"
        >
          <div
            class="embla__container flex flex-row items-stretch gap-x-3 sm:gap-x-4 lg:gap-x-[18px]"
          >
            <div
              v-for="{ item, slideKey } in props.slides"
              :key="slideKey"
              class="embla__slide flex min-w-[4.25rem] shrink-0 flex-col sm:min-w-[4.5rem] lg:min-w-[5rem]"
            >
              <div
                :class="tileClass(slideKey)"
                @mouseenter="onTileEnter(slideKey)"
                @mouseleave="onTileLeave"
              >
                <img
                  :src="item.src"
                  :alt="item.alt"
                  :class="mediaClass(slideKey)"
                  width="36"
                  height="36"
                  loading="eager"
                  decoding="async"
                  draggable="false"
                >
                <span
                  class="max-w-full px-0.5 text-center text-[0.6875rem] leading-tight transition-colors duration-200 sm:text-xs"
                  :class="isActive(slideKey) ? 'text-highlighted' : 'text-muted'"
                >{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-carousel-viewport {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 4%,
    black 96%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 4%,
    black 96%,
    transparent
  );
}

@media (min-width: 640px) {
  .tech-carousel-viewport {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      black 3%,
      black 97%,
      transparent
    );
    mask-image: linear-gradient(
      to right,
      transparent,
      black 3%,
      black 97%,
      transparent
    );
  }
}
</style>
