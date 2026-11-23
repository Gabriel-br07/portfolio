<script setup lang="ts">
defineProps<{
  themes: { title: string }[]
  active: number
  segments: number[]
}>()

const { t } = useI18n()
</script>

<template>
  <nav
    :aria-label="t('experience.onThisPage')"
    class="exp-rail-nav hidden lg:block"
  >
    <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
      {{ t('experience.onThisPage') }}
    </p>
    <ol class="exp-rail">
      <li
        v-for="(theme, index) in themes"
        :key="theme.title"
        :class="{ 'is-on': index === active, 'is-seen': index <= active, 'is-last': index === themes.length - 1 }"
        :style="{ '--seg': segments[index] ?? 0 }"
      >
        <a
          :href="`#theme-${index}`"
          :aria-current="index === active ? 'location' : undefined"
        >
          <span
            class="exp-orb exp-dot"
            aria-hidden="true"
          />
          <span class="exp-label">{{ theme.title }}</span>
        </a>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* overflow-y:auto also clips the X axis (and the ring's box-shadow). The 0.75rem padding, offset by the
   negative margin, gives the ring room without moving anything. */
.exp-rail-nav {
  position: sticky;
  top: 7rem;
  align-self: start;
  max-height: calc(100dvh - 8rem);
  overflow-y: auto;
  margin: -0.75rem;
  padding: 0.75rem;
}

.exp-rail {
  margin: 0;
  padding: 0;
  list-style: none;
}

.exp-rail li {
  position: relative;
}

.exp-rail a {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr); /* fixed-width track: line and sphere share the same axis */
  column-gap: 0.75rem;
  padding-block: 0.55rem;
  color: var(--ui-text-muted);
  text-decoration: none;
}

.exp-rail a:focus-visible {
  outline: 2px solid var(--exp-accent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.exp-label {
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

.exp-dot {
  justify-self: center; /* exact center of the track */
  align-self: start;
  margin-top: 0.25rem; /* (1.25rem line height - 0.75rem) / 2: aligns with the first line of the label */
  z-index: 1;
}

/* Segment to the next sphere: same axis, starting at the sphere center */
.exp-rail li:not(.is-last)::before,
.exp-rail li:not(.is-last)::after {
  content: '';
  position: absolute;
  top: calc(0.55rem + 0.25rem + 0.375rem);
  left: 0.5rem;
  width: 2px;
  height: 100%;
  margin-left: -1px;
}

.exp-rail li::before {
  background: var(--ui-border);
}

.exp-rail li::after {
  background: var(--exp-accent);
  transform: scaleY(var(--seg, 0));
  transform-origin: top;
}

.exp-rail li.is-seen .exp-dot {
  border-color: var(--exp-accent);
}

.exp-rail li.is-on a {
  color: var(--ui-text-highlighted);
  font-weight: 600;
}

.exp-rail li:hover .exp-dot,
.exp-rail li:focus-within .exp-dot {
  border-color: var(--exp-accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--exp-accent) 55%, transparent);
}

/* Selected: filled sphere + ring (box-shadow does not change the layout) */
.exp-rail li.is-on .exp-dot {
  background: var(--exp-accent);
  border-color: var(--exp-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--exp-accent) 22%, transparent),
    0 0 12px color-mix(in srgb, var(--exp-accent) 45%, transparent);
}
</style>
