<script setup lang="ts">
// Scoped motion-v config: keeps `reduced-motion="user"` for the only two
// consumers (WorkExperience, projects) instead of the app root, so motion-v
// stays out of the shared entry graph.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <MotionConfig reduced-motion="user">
    <Motion
      v-bind="$attrs"
    >
      <slot />
    </Motion>
  </MotionConfig>
</template>
