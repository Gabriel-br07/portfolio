<script setup lang="ts">
const links = useNavLinks()
</script>

<template>
  <div>
    <UContainer class="sm:border-x border-default pt-10">
      <AppHeader :links="links" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
