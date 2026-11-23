<script setup lang="ts">
withDefaults(defineProps<{
  tags: string[]
  /** Show the technology logo inside each tag (experience stacks). Off for plain labels, e.g. projects. */
  showIcons?: boolean
}>(), { showIcons: true })

const root = ref<HTMLElement | null>(null)
// Pauses the beam animations while the list is off screen.
// Starts visible (SSR and first paint), the observer turns it off when the list is out of view.
const visible = useElementVisibility(root, { initialValue: true })
</script>

<template>
  <ul
    ref="root"
    class="tech-tags"
    :data-inview="visible"
  >
    <li
      v-for="(tag, index) in tags"
      :key="`${index}-${tag}`"
    >
      <TechTag
        :label="tag"
        :icon="iconFor(tag, showIcons)"
      />
    </li>
  </ul>
</template>

<style scoped>
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tech-tags[data-inview='false'] :deep(.tech-tag__beam) {
  animation-play-state: paused;
}
</style>
