<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IndexCollectionItem } from '@nuxt/content'
import type { ExperienceItem } from '~/types/experience'

type IndexPageWithExperience = IndexCollectionItem & {
  experience: { title: string, items: ExperienceItem[] }
}

const props = defineProps<{
  page: IndexPageWithExperience
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const items = computed(() => props.page.experience.items)

// Phones get the bottom sheet, everything else navigates to the case-study page.
// `useMediaQuery` is false on the server, so SSR always renders a plain, crawlable link.
const isMobile = useMediaQuery('(max-width: 767px)')
const sheetSlug = ref<string | null>(null)
const sheetOpen = ref(false)

function onReadFull(event: MouseEvent, slug: string) {
  const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
  if (!isMobile.value || modified) return
  event.preventDefault()
  sheetSlug.value = slug
  sheetOpen.value = true
}
</script>

<template>
  <UPageSection
    id="experience"
    class="scroll-mt-28"
    :title="page.experience.title"
    :ui="{
      container: '!p-0 gap-4 sm:gap-4',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'mt-2'
    }"
  >
    <template #description>
      <ol class="experience-timeline text-left">
        <li
          v-for="(experience, index) in items"
          :key="experience.slug"
          data-reveal
          class="experience-item exp-scope"
          :class="{ 'experience-item--current': index === 0 }"
          :style="accentStyle(experience.company)"
        >
          <span
            class="exp-orb experience-orb"
            aria-hidden="true"
          />
          <p class="text-xs text-muted">
            {{ experience.date }}
          </p>
          <p class="text-sm text-default">
            {{ experience.position }}
          </p>

          <ULink
            v-if="experience.company?.url"
            :to="experience.company.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t('experience.visitCompany', { company: experience.company.name })"
            class="-my-2 mt-0 inline-flex min-h-11 items-center py-2"
          >
            <LandingExperienceCompanyLogo
              :experience
              :eager="index === 0"
            />
          </ULink>
          <LandingExperienceCompanyLogo
            v-else
            :experience
            :eager="index === 0"
            class="mt-2"
          />

          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ experience.summary }}
          </p>
          <TechTagList
            class="mt-2"
            :tags="experience.stack"
          />

          <details
            class="experience-details"
            name="experience-highlights"
          >
            <summary>{{ t('experience.highlights') }}</summary>
            <ul>
              <li
                v-for="highlight in experience.highlights"
                :key="highlight"
              >
                {{ highlight }}
              </li>
            </ul>
            <NuxtLink
              :to="localePath(`/experience/${experience.slug}`)"
              class="experience-cta"
              :aria-label="`${t('experience.readFull')}: ${experience.company?.name ?? ''}`"
              @click="onReadFull($event, experience.slug)"
            >
              {{ t('experience.readFull') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5"
              />
            </NuxtLink>
          </details>
        </li>
      </ol>

      <!-- Created on the first tap and kept mounted afterwards so the close animation can finish. -->
      <LazyExperienceSheet
        v-if="sheetSlug"
        v-model:open="sheetOpen"
        :slug="sheetSlug"
      />
    </template>
  </UPageSection>
</template>

<style scoped>
.experience-timeline {
  list-style: none;
  margin: 0 0 0 0.375rem;
  padding: 0 0 0 1.5rem;
  border-left: 1px solid var(--ui-border);
}

.experience-item {
  position: relative;
  padding-bottom: 1.5rem;
}

.experience-item:last-child {
  padding-bottom: 0;
}

/* Timeline marker: a sphere (global .exp-orb) in the company color, centered on the vertical rail.
   border-left is 1px at 1.5rem from the content, so the sphere center sits at -1.5rem - 0.5px. */
.experience-orb {
  position: absolute;
  top: 0.3rem;
  left: calc(-1.5rem - 6px - 0.5px);
  border-color: var(--exp-accent);
}

.experience-item:hover .experience-orb {
  box-shadow: 0 0 10px color-mix(in srgb, var(--exp-accent) 55%, transparent);
}

/* Current role: filled sphere + soft pulsing ring */
.experience-item--current .experience-orb {
  background: var(--exp-accent);
}

.experience-item--current::after {
  content: '';
  position: absolute;
  top: 0.3rem;
  left: calc(-1.5rem - 6px - 0.5px);
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  border: 2px solid var(--exp-accent);
  pointer-events: none;
  animation: experience-pulse 1.9s ease-out infinite;
}

@keyframes experience-pulse {
  from {
    transform: scale(1);
    opacity: 0.9;
  }
  to {
    transform: scale(3);
    opacity: 0;
  }
}

/* Level 2: highlights open in place (native <details>, height animates where interpolate-size is supported) */
.experience-details {
  margin-top: 0.5rem;
  interpolate-size: allow-keywords;
}

.experience-details > summary {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  list-style: none;
  font-size: 0.75rem;
  color: var(--ui-text-highlighted);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.experience-details > summary::-webkit-details-marker {
  display: none;
}

/* Chevron drawn with borders: a text glyph (e.g. "▸") is outside the Latin unicode-range of the web font
   and would make the browser download a second, 29 KB font file just to render it. */
.experience-details > summary::before {
  content: '';
  width: 0.4rem;
  height: 0.4rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.25s;
}

.experience-details[open] > summary::before {
  transform: rotate(45deg);
}

.experience-details::details-content {
  block-size: 0;
  overflow: clip;
  transition: block-size 0.3s ease, content-visibility 0.3s allow-discrete;
}

.experience-details[open]::details-content {
  block-size: auto;
}

.experience-details ul {
  margin: 0.5rem 0 0;
  padding-left: 1.125rem;
  list-style: disc;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--ui-text-muted);
}

.experience-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--ui-text-highlighted);
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .experience-item--current::after {
    animation: none;
    display: none;
  }

  .experience-details::details-content {
    transition: none;
  }
}
</style>
