<script setup lang="ts">
import type { TechIcon } from '~/utils/techIcons'

defineProps<{
  label: string
  icon?: TechIcon
}>()
</script>

<template>
  <span class="tech-tag">
    <span
      class="tech-tag__beam"
      aria-hidden="true"
    />
    <span class="tech-tag__label">
      <svg
        v-if="icon"
        class="tech-tag__icon"
        viewBox="0 0 24 24"
        :fill="icon.stroke ? 'none' : 'currentColor'"
        :stroke="icon.stroke ? 'currentColor' : 'none'"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          v-for="path in icon.paths"
          :key="path"
          :d="path"
        />
      </svg>
      {{ label }}
    </span>
  </span>
</template>

<style scoped>
.tech-tag {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  contain: paint;
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: var(--ui-text-highlighted);
  background: var(--ui-bg-elevated);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--exp-accent) 32%, var(--ui-border));
  transition: box-shadow 0.25s, transform 0.25s;
}

/* Inner cap: leaves only a 1.5px ring of the rotating beam visible */
.tech-tag::after {
  content: '';
  position: absolute;
  inset: 1.5px;
  z-index: -1;
  border-radius: inherit;
  background: var(--ui-bg-elevated);
}

.tech-tag__beam {
  position: absolute;
  inset: -200%;
  z-index: -2;
  background: conic-gradient(from 0deg, transparent 55%, var(--exp-accent) 80%, transparent 100%);
  animation: exp-rotate 3.2s linear infinite;
}

.tech-tag__label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.tech-tag__icon {
  width: 0.9rem;
  height: 0.9rem;
  flex: none;
  color: var(--exp-accent);
}

.tech-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px var(--exp-accent), 0 0 18px color-mix(in srgb, var(--exp-accent) 50%, transparent);
}

@keyframes tech-tag-once {
  0% {
    transform: rotate(0);
    opacity: 1;
  }

  85% {
    opacity: 1;
  }

  100% {
    transform: rotate(360deg);
    opacity: 0;
  }
}

/* Phones have no hover: one turn when the list enters the viewport, then only the outline */
@media (max-width: 767px) {
  .tech-tag__beam {
    animation: tech-tag-once 2.4s ease-out 1 both;
  }

  .tech-tag:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-tag__beam {
    display: none; /* the static ring from box-shadow remains */
  }

  .tech-tag:hover {
    transform: none;
  }
}
</style>
