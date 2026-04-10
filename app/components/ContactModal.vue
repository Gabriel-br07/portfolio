<script setup lang="ts">
const { t } = useI18n()
const { global } = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

if (import.meta.dev) {
  const key = String(runtimeConfig.public.web3formsAccessKey ?? '').trim()
  if (!key) {
    console.warn(
      '[portfolio] NUXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not set. Contact form submissions will fail until it is configured.'
    )
  }
}

const { isOpen, screen, open, close, reset } = useContactModal()
const localePath = useLocalePath()

const name = ref('')
const email = ref('')
const message = ref('')
const submitStatus = ref<'idle' | 'loading' | 'error'>('idle')

function resetForm() {
  name.value = ''
  email.value = ''
  message.value = ''
  submitStatus.value = 'idle'
}

watch(isOpen, (v) => {
  if (!v) {
    resetForm()
    reset()
  }
})

function goToForm() {
  screen.value = 'form'
}

function goToChoice() {
  screen.value = 'choice'
  submitStatus.value = 'idle'
}

function isHomeRoute() {
  const homePath = localePath('/')
  const path = route.path.replace(/\/$/, '') || '/'
  const home = homePath.replace(/\/$/, '') || '/'
  return path === home
}

function consumeContactHash() {
  if (route.hash !== '#contact' || !isHomeRoute()) return
  open()
  router.replace({ path: route.path, query: route.query, hash: '' })
}

onMounted(() => {
  consumeContactHash()
})

watch(
  () => [route.path, route.hash] as const,
  () => {
    consumeContactHash()
  }
)

async function onSubmit() {
  const accessKey = String(runtimeConfig.public.web3formsAccessKey ?? '').trim()
  if (!accessKey) {
    submitStatus.value = 'error'
    return
  }

  submitStatus.value = 'loading'
  try {
    const res = await $fetch<{ success?: boolean, message?: string }>(
      'https://api.web3forms.com/submit',
      {
        method: 'POST',
        body: {
          access_key: accessKey,
          name: name.value,
          email: email.value,
          message: message.value
        }
      }
    )
    if (res.success) {
      screen.value = 'success'
      resetForm()
    } else {
      submitStatus.value = 'error'
    }
  } catch {
    submitStatus.value = 'error'
  }
}

const meetingUrl = computed(() => global.meetingLink)

const modalTitle = computed(() =>
  screen.value === 'success' ? t('contactModal.successTitle') : t('contactModal.title')
)

const modalDescription = computed(() => {
  if (screen.value === 'choice') return t('contactModal.description')
  if (screen.value === 'form') return t('contactModal.formLead')
  return undefined
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="modalDescription"
    scrollable
    :ui="{ footer: 'hidden' }"
  >
    <template #body>
      <div class="space-y-4">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="screen === 'choice'"
            key="choice"
            class="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <UButton
              :to="meetingUrl"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              size="lg"
              block
              class="sm:flex-1"
              icon="i-lucide-calendar"
              :label="t('contactModal.bookMeeting')"
            />
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              block
              class="sm:flex-1 cursor-pointer"
              icon="i-lucide-mail"
              :label="t('contactModal.sendMessage')"
              @click="goToForm"
            />
          </div>

          <form
            v-else-if="screen === 'form'"
            key="form"
            class="space-y-4"
            @submit.prevent="onSubmit"
          >
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              class="-mt-1 -ms-1.5 mb-1"
              icon="i-lucide-arrow-left"
              :label="t('contactModal.back')"
              @click="goToChoice"
            />

            <UFormField
              :label="t('contactModal.nameLabel')"
              name="name"
              required
            >
              <UInput
                v-model="name"
                name="name"
                autocomplete="name"
                required
              />
            </UFormField>

            <UFormField
              :label="t('contactModal.emailLabel')"
              name="email"
              required
            >
              <UInput
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                required
              />
            </UFormField>

            <UFormField
              :label="t('contactModal.messageLabel')"
              name="message"
              required
            >
              <UTextarea
                v-model="message"
                name="message"
                :rows="5"
                autoresize
                required
                class="w-full"
              />
            </UFormField>

            <UAlert
              v-if="submitStatus === 'error'"
              color="error"
              variant="subtle"
              :title="t('contactModal.errorTitle')"
              :description="t('contactModal.errorDescription')"
            />

            <UButton
              type="submit"
              color="primary"
              block
              size="lg"
              :loading="submitStatus === 'loading'"
              :disabled="submitStatus === 'loading'"
              :label="t('contactModal.submit')"
            />
          </form>

          <div
            v-else-if="screen === 'success'"
            key="success"
            class="space-y-4 py-1 text-center"
          >
            <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <UIcon
                name="i-lucide-check"
                class="size-6"
              />
            </div>
            <p class="text-sm text-muted">
              {{ t('contactModal.successDescription') }}
            </p>
            <UButton
              color="neutral"
              variant="outline"
              block
              :label="t('contactModal.close')"
              @click="close"
            />
          </div>
        </Transition>
      </div>
    </template>
  </UModal>
</template>
