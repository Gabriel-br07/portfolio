<script setup lang="ts">
import MascotClawd from './characters/MascotClawd.vue'
import MascotClawdReader from './characters/MascotClawdReader.vue'
import type { Component } from 'vue'
import type { MascotState } from '~/types/mascots'

const props = withDefaults(defineProps<{
  /** Rig state — drives the `[data-state]` CSS animations. */
  state?: MascotState
  /** Horizontal direction the character faces; -1 mirrors the art. */
  facing?: 1 | -1
}>(), {
  state: 'idle',
  facing: 1
})

/** Activity scenes have their own artwork; every other state uses the walking rig. */
const SCENE_COMPONENTS: Partial<Record<MascotState, Component>> = {
  read: MascotClawdReader,
  // Its ~109 KB of generated keyframes only ship with the /projects chunk.
  exercise: defineAsyncComponent(() => import('./characters/MascotClawdExercise.vue'))
}

const character = computed(() => SCENE_COMPONENTS[props.state] ?? MascotClawd)
</script>

<template>
  <!-- Decorative: never focusable, never intercepts pointers. -->
  <div
    class="mascot-flip"
    aria-hidden="true"
    :style="{ transform: facing === -1 ? 'scaleX(-1)' : undefined }"
  >
    <component
      :is="character"
      :data-state="state"
    />
  </div>
</template>
