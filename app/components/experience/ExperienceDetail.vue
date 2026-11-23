<script setup lang="ts">
import type { ExperienceCaseDetail, ExperienceItem } from '~/types/experience'

const props = withDefaults(defineProps<{
  item: ExperienceItem
  detail: ExperienceCaseDetail
  /** The page shows the summary in its hero; the sheet shows it here. */
  showSummary?: boolean
}>(), { showSummary: true })

const { t } = useI18n()
const accent = computed(() => accentStyle(props.item.company))
</script>

<template>
  <!-- `exp-scope` lives here too (not only on the page): the mobile sheet is teleported outside the page wrapper. -->
  <article
    class="exp-scope max-w-prose space-y-6"
    :style="accent"
  >
    <!-- Labelled facts block (AEO/GEO): who, when, with what. -->
    <dl class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm">
      <dt class="flex items-center gap-2 text-muted">
        <UIcon
          name="i-lucide-building-2"
          class="size-4 text-(--exp-accent)"
          aria-hidden="true"
        />
        {{ t('experience.company') }}
      </dt>
      <dd>
        <ULink
          v-if="item.company?.url"
          :to="item.company.url"
          target="_blank"
          rel="noopener"
          :aria-label="item.company.name"
          class="inline-flex"
        >
          <LandingExperienceCompanyLogo :experience="item" />
        </ULink>
        <LandingExperienceCompanyLogo
          v-else
          :experience="item"
        />
      </dd>
      <dt class="flex items-center gap-2 text-muted">
        <UIcon
          name="i-lucide-calendar"
          class="size-4 text-(--exp-accent)"
          aria-hidden="true"
        />
        {{ t('experience.period') }}
      </dt>
      <dd class="text-default">
        {{ item.date }}
      </dd>
      <dt class="flex items-center gap-2 text-muted">
        <UIcon
          name="i-lucide-layers"
          class="size-4 text-(--exp-accent)"
          aria-hidden="true"
        />
        {{ t('experience.stack') }}
      </dt>
      <dd>
        <TechTagList :tags="item.stack" />
      </dd>
    </dl>

    <p
      v-if="showSummary"
      class="text-base leading-relaxed text-default"
    >
      {{ item.summary }}
    </p>

    <div class="rounded-lg border border-l-4 border-default border-l-(--exp-accent) bg-elevated/50 p-4">
      <p class="text-sm font-semibold text-highlighted">
        {{ t('experience.highlights') }}
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-default">
        <li
          v-for="highlight in item.highlights"
          :key="highlight"
        >
          {{ highlight }}
        </li>
      </ul>
    </div>

    <section
      v-for="(theme, index) in detail.themes"
      :id="`theme-${index}`"
      :key="theme.title"
      class="scroll-mt-28 space-y-2"
    >
      <h2 class="text-lg font-semibold text-highlighted">
        <!-- Phones and tablets have no side rail: a small marker in the accent color stands in for it -->
        <span
          class="mr-2 inline-block size-2 rounded-full bg-(--exp-accent) align-[0.1em] lg:hidden"
          aria-hidden="true"
        />
        {{ theme.title }}
      </h2>
      <p
        v-for="(paragraph, i) in theme.paragraphs"
        :key="i"
        class="text-sm leading-relaxed text-default"
      >
        {{ paragraph }}
      </p>
    </section>
  </article>
</template>
