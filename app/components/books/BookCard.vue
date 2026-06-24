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

const { start, stop } = useTypedHumanized(typedTargetRef, () => whyReadText.value)

watch(showWhyRead, (open) => {
  if (!open) {
    stop()
  }
})

/** Re-type in the new locale if the panel is open. */
watch(locale, async () => {
  if (!showWhyRead.value) return
  stop()
  await nextTick()
  await start()
})

async function onWhyReadAfterEnter() {
  await start()
}

function toggleWhyRead() {
  showWhyRead.value = !showWhyRead.value
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
          v-if="book.currentlyReading"
          color="primary"
          variant="subtle"
          size="sm"
          class="font-medium"
        >
          {{ t('livros.currentlyReading') }}
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
            :aria-expanded="showWhyRead"
            :icon="showWhyRead ? 'i-lucide-chevron-up' : 'i-lucide-sparkles'"
            @click="toggleWhyRead"
          >
            {{ t('livros.whyRead') }}
          </UButton>
        </div>

        <Transition
          name="book-why"
          @after-enter="onWhyReadAfterEnter"
        >
          <div
            v-if="showWhyRead"
            class="book-why-panel mt-4 border-t border-default pt-4 text-left"
          >
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {{ t('livros.whyReadHeading') }}
            </p>
            <!-- typed.js coloca o cursor como irmão do nó: inline evita o cursor “descer” para a linha seguinte -->
            <div
              class="typed-wrap min-h-[4.5rem] text-sm leading-relaxed text-default"
            >
              <span
                ref="typedTargetRef"
                class="typed-target inline"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.book-why-enter-active,
.book-why-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.book-why-enter-from,
.book-why-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.typed-wrap {
  white-space: pre-line;
  word-break: break-word;
}

.typed-wrap :deep(.typed-cursor) {
  display: inline;
  vertical-align: baseline;
  opacity: 0.85;
}
</style>
