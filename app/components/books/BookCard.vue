<script setup lang="ts">
import type { RecommendedBook } from '~/data/recommended-books'

const props = defineProps<{
  book: RecommendedBook
}>()

const { t, locale } = useI18n()

const showWhyRead = ref(false)
const typedTargetRef = ref<HTMLElement | null>(null)

const whyReadText = computed(() =>
  t(`livros.books.${props.book.id}.whyRead`)
)

const statusBadge = computed(() => {
  switch (props.book.status) {
    case 'read':
      return { label: t('livros.read'), color: 'success' as const }
    case 'reading':
      return { label: t('livros.currentlyReading'), color: 'primary' as const }
    case 'next':
      return { label: t('livros.nextReading'), color: 'neutral' as const }
    default:
      return null
  }
})

const { start, stop } = useTypedHumanized(typedTargetRef, () => whyReadText.value)

watch(showWhyRead, (open) => {
  if (!open) {
    stop()
  }
})

/** Re-type in the new locale if the modal is open. */
watch(locale, async () => {
  if (!showWhyRead.value) return
  stop()
  await nextTick()
  await start()
})

/** The typed target only exists once the modal content is mounted and has finished entering. */
async function onWhyReadAfterEnter() {
  await start()
}
</script>

<template>
  <UCard
    variant="subtle"
    class="group flex w-full min-h-[28rem] min-w-0 max-w-full flex-col self-start transition-shadow duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    :ui="{
      root: 'flex h-auto min-h-0 min-w-0 flex-col self-start',
      body: 'flex flex-1 flex-col gap-0 p-4 sm:p-5'
    }"
  >
    <div class="flex h-full min-h-0 flex-1 flex-col">
      <!-- Reserved top row: same height on every card; badge only for the active book. -->
      <div class="flex h-7 shrink-0 items-center justify-center">
        <UBadge
          v-if="statusBadge"
          :color="statusBadge.color"
          variant="subtle"
          size="sm"
          class="font-medium"
        >
          {{ statusBadge.label }}
        </UBadge>
      </div>

      <div
        class="mx-auto mt-2 w-full max-w-[10.5rem] shrink-0 overflow-hidden rounded-md ring ring-default"
      >
        <NuxtImg
          :src="book.coverSrc"
          :alt="book.coverAlt"
          width="168"
          height="252"
          sizes="168px"
          format="webp"
          loading="lazy"
          decoding="async"
          class="aspect-[2/3] h-auto w-full object-cover"
        />
      </div>

      <div class="mt-4 flex min-h-0 min-w-0 flex-1 flex-col gap-1 text-center">
        <h3 class="line-clamp-4 text-sm font-semibold leading-snug text-highlighted">
          {{ book.title }}
        </h3>
        <p class="text-xs text-muted">
          {{ book.author }}
        </p>

        <div class="mt-auto flex flex-wrap justify-center gap-2 pt-4">
          <UButton
            :to="book.buyUrl"
            target="_blank"
            rel="noopener noreferrer"
            icon="i-lucide-shopping-cart"
            size="sm"
          >
            {{ t('livros.buy') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            aria-haspopup="dialog"
            icon="i-lucide-sparkles"
            @click="showWhyRead = true"
          >
            {{ t('livros.whyRead') }}
          </UButton>
        </div>

        <!-- Teleported to <body> by Nuxt UI, so it sits above the neighbouring cards instead of growing this one. -->
        <UModal
          v-model:open="showWhyRead"
          :title="book.title"
          :description="t('livros.whyReadHeading')"
          :close="{ 'aria-label': t('livros.close') }"
          :ui="{ content: 'book-why-modal' }"
          @after:enter="onWhyReadAfterEnter"
        >
          <template #body>
            <!-- typed.js coloca o cursor como irmão do nó: inline evita o cursor “descer” para a linha seguinte -->
            <div class="typed-wrap min-h-[4.5rem] text-sm leading-relaxed text-default">
              <span
                ref="typedTargetRef"
                class="typed-target inline"
              />
            </div>
          </template>
        </UModal>
      </div>
    </div>
  </UCard>
</template>

<!-- Not scoped: the modal content is teleported out of this component's DOM subtree. -->
<style>
.book-why-modal .typed-wrap {
  white-space: pre-line;
  word-break: break-word;
}

.book-why-modal .typed-wrap .typed-cursor {
  display: inline;
  vertical-align: baseline;
  opacity: 0.85;
}
</style>
