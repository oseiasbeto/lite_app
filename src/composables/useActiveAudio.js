import { ref } from 'vue'

// Estado partilhado (singleton) entre TODAS as instâncias de MessageBox.
// Garante que nunca há mais que um áudio de voz a tocar ao mesmo tempo.
const activeAudio = ref(null) // { id: string, el: HTMLAudioElement }

export function useActiveAudio() {
  const setActive = (id, el) => {
    if (activeAudio.value && activeAudio.value.id !== id && activeAudio.value.el !== el) {
      try { activeAudio.value.el.pause() } catch (e) { /* noop */ }
    }
    activeAudio.value = { id, el }
  }

  const clearActive = (id) => {
    if (activeAudio.value?.id === id) activeAudio.value = null
  }

  return { setActive, clearActive }
}