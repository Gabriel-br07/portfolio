export type ContactModalScreen = 'choice' | 'form' | 'success'

export function useContactModal() {
  const isOpen = useState<boolean>('contact-modal-open', () => false)
  const screen = useState<ContactModalScreen>('contact-modal-screen', () => 'choice')

  function open() {
    screen.value = 'choice'
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function reset() {
    screen.value = 'choice'
  }

  return {
    isOpen,
    screen,
    open,
    close,
    reset
  }
}
