<script setup lang="ts">
import type { TechCarouselSlide, TechItem } from '~/types/tech-carousel'

const { t } = useI18n()
const prefersReducedMotion = usePreferredReducedMotion()

/**
 * SSR + first client paint: always false until mount, so server and hydration both render
 * the static grid (stable markup). After mount, true only when motion is allowed.
 * The Embla branch uses `v-if` so it mounts only when visible — Embla must measure a real viewport
 * width; `v-show` could init while `display: none` and break `loop` / auto-scroll. Theme toggles do
 * not flip `showAnimatedCarousel`, so the Embla instance stays mounted across dark/light changes.
 */
const hasMounted = ref(false)
onMounted(() => {
  hasMounted.value = true
})

const showAnimatedCarousel = computed(
  () => hasMounted.value && prefersReducedMotion.value === 'no-preference'
)

/** Enough repeats for `loop: true` on wide viewports (Embla needs sufficient scroll length) */
const EMBLA_REPEAT_COUNT = 5

const sectionUi = {
  container: '!pt-8 !pb-6 sm:!pt-10 sm:!pb-8',
  title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
  description: 'mt-0'
}

const techItems: readonly TechItem[] = [
  { key: 'linux', src: '/icons/tech/linux.svg', label: 'Linux', alt: 'Linux' },
  { key: 'python', src: '/icons/tech/python.svg', label: 'Python', alt: 'Python' },
  { key: 'dotnet', src: '/icons/tech/dotnet.svg', label: '.NET', alt: '.NET' },
  { key: 'csharp', src: '/icons/tech/csharp.svg', label: 'C#', alt: 'C#' },
  { key: 'react', src: '/icons/tech/react.svg', label: 'React', alt: 'React' },
  { key: 'vue', src: '/icons/tech/vue.svg', label: 'Vue', alt: 'Vue' },
  { key: 'nuxt', src: '/icons/tech/nuxt.svg', label: 'Nuxt', alt: 'Nuxt' },
  { key: 'go', src: '/icons/tech/go-gopher.svg', label: 'Go', alt: 'Go Gopher' },
  { key: 'rust', src: '/icons/tech/rust-ferris.png', label: 'Rust', alt: 'Ferris, the Rust mascot' },
  { key: 'docker', src: '/icons/tech/docker.svg', label: 'Docker', alt: 'Docker' },
  { key: 'postgresql', src: '/icons/tech/postgresql.svg', label: 'PostgreSQL', alt: 'PostgreSQL' },
  { key: 'mongodb', src: '/icons/tech/mongodb.svg', label: 'MongoDB', alt: 'MongoDB' },
  { key: 'typescript', src: '/icons/tech/typescript.svg', label: 'TypeScript', alt: 'TypeScript' },
  { key: 'fastapi', src: '/icons/tech/fastapi.svg', label: 'FastAPI', alt: 'FastAPI' },
  { key: 'django', src: '/icons/tech/django.svg', label: 'Django', alt: 'Django', invertOnDark: true },
  { key: 'flask', src: '/icons/tech/flask.svg', label: 'Flask', alt: 'Flask', invertOnDark: true },
  { key: 'nextjs', src: '/icons/tech/nextjs.svg', label: 'Next.js', alt: 'Next.js', invertOnDark: true },
  { key: 'tailwind', src: '/icons/tech/tailwind-css.svg', label: 'Tailwind CSS', alt: 'Tailwind CSS' },
  { key: 'graphql', src: '/icons/tech/graphql.svg', label: 'GraphQL', alt: 'GraphQL' },
  { key: 'redis', src: '/icons/tech/redis.svg', label: 'Redis', alt: 'Redis' },
  { key: 'jupyter', src: '/icons/tech/jupyter.svg', label: 'Jupyter', alt: 'Jupyter' },
  { key: 'playwright', src: '/icons/tech/playwright.svg', label: 'Playwright', alt: 'Playwright' },
  { key: 'git', src: '/icons/tech/git.svg', label: 'Git', alt: 'Git' },
  { key: 'github', src: '/icons/tech/github.svg', label: 'GitHub', alt: 'GitHub', invertOnDark: true },
  { key: 'github-actions', src: '/icons/tech/github-actions.svg', label: 'GitHub Actions', alt: 'GitHub Actions' },
  { key: 'jetbrains', src: '/icons/tech/jetbrains.svg', label: 'JetBrains', alt: 'JetBrains' },
  { key: 'android-studio', src: '/icons/tech/android-studio.svg', label: 'Android Studio', alt: 'Android Studio' },
  { key: 'insomnia', src: '/icons/tech/insomnia.svg', label: 'Insomnia', alt: 'Insomnia' }
]

const emblaSlides = computed((): TechCarouselSlide[] => {
  const repeated: TechItem[] = []
  for (let r = 0; r < EMBLA_REPEAT_COUNT; r++) {
    repeated.push(...techItems)
  }
  return repeated.map((item, index) => ({ item, slideKey: `${item.key}-${index}` }))
})

/** Shared size + motion for icons and images (carousel + reduced-motion parity) */
const techMediaSize = 'size-8 sm:size-9 shrink-0 object-contain'
const techMediaTransition = 'transition-[filter,opacity,transform] duration-200 ease-out'

/** Static list: hover parity with carousel; no focus styling (tiles are not interactive). */
const staticMediaHover
  = `${techMediaSize} ${techMediaTransition} text-muted grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03]`
</script>

<template>
  <UPageSection
    :title="t('home.techCarouselTitle')"
    :ui="sectionUi"
  >
    <template #description>
      <div class="mt-4 -mx-4 sm:-mx-6 overflow-hidden">
        <!-- SSR + pre-mount + reduced-motion: static grid only (no Embla in SSR HTML). -->
        <div
          v-if="!showAnimatedCarousel"
          class="mx-auto max-w-6xl px-4 sm:px-6"
          :aria-hidden="showAnimatedCarousel"
        >
          <ul
            class="m-0 flex list-none flex-wrap justify-center gap-x-6 gap-y-4 p-0 sm:gap-x-7 sm:gap-y-5"
          >
            <li
              v-for="item in techItems"
              :key="item.key"
              class="group flex min-w-[3.75rem] flex-col items-center gap-1.5 rounded-lg p-1 transition-colors sm:min-w-[4rem] sm:gap-2 sm:rounded-xl sm:p-1.5 hover:bg-elevated/40"
            >
              <img
                :src="item.src"
                :alt="item.alt"
                :class="[staticMediaHover, item.invertOnDark && 'dark:invert']"
                width="36"
                height="36"
                loading="lazy"
                decoding="async"
              >
              <span class="max-w-[5.5rem] text-center text-[0.6875rem] leading-tight text-muted sm:text-xs">{{
                item.label
              }}</span>
            </li>
          </ul>
        </div>
        <!-- Mount only when animated — viewport has real dimensions (see script comment). -->
        <LandingTechCarouselEmbla
          v-else
          :slides="emblaSlides"
          :aria-hidden="!showAnimatedCarousel"
        />
      </div>
    </template>
  </UPageSection>
</template>
