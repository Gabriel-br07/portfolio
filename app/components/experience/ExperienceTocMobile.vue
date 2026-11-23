<script setup lang="ts">
defineProps<{
  themes: { title: string }[]
  active: number
}>()

const { t } = useI18n()
</script>

<template>
  <!-- Phones and tablets have no side rail (ExperienceRail is lg+): a collapsible list of the same sections. -->
  <details class="mb-6 rounded-lg border border-default bg-elevated/50 lg:hidden">
    <summary class="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold text-highlighted">
      {{ t('experience.onThisPage') }}
    </summary>
    <ol class="m-0 list-none px-2 pb-2">
      <li
        v-for="(theme, index) in themes"
        :key="theme.title"
      >
        <a
          :href="`#theme-${index}`"
          :aria-current="index === active ? 'location' : undefined"
          class="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--exp-accent) aria-[current=location]:font-semibold aria-[current=location]:text-highlighted"
        >
          <span
            class="size-2 shrink-0 rounded-full bg-(--exp-accent)"
            aria-hidden="true"
          />
          {{ theme.title }}
        </a>
      </li>
    </ol>
  </details>
</template>
