import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const needRefresh = ref(false)

const updateSW = registerSW({
  onNeedRefresh () {
    console.log('refresh needed')
    needRefresh.value = true
  }
})

export function useSW () {
  return {
    needRefresh,
    updateSW,
    dismiss () {
      needRefresh.value = false
    }
  }
}
