import { ref, computed } from 'vue'

export function useWakeLock () {
  const sentinel = ref<WakeLockSentinel>()

  if (!window.navigator.wakeLock) {
    return {
      isSupported: false,
      isActive: ref(false),
      async request () {},
      async release () {}
    }
  }

  return {
    isSupported: true,
    isActive: computed(() => sentinel.value && !sentinel.value.released),
    async request () {
      if (sentinel.value && !sentinel.value.released) return

      sentinel.value = await window.navigator.wakeLock.request('screen')
    },
    async release () {
      await sentinel.value?.release()
      sentinel.value = undefined
    }
  }
}
