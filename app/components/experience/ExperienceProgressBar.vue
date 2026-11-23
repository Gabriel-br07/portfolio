<script setup lang="ts">
defineProps<{
  overall: number
}>()
</script>

<template>
  <!-- Decorative: the reading position is already exposed by the section navigation. -->
  <div
    class="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-(--exp-accent) lg:hidden"
    :style="{ transform: `scaleX(${overall})` }"
    aria-hidden="true"
  />
</template>
