import { ref } from 'vue'
import { onClickOutside, useTimeoutFn } from '@vueuse/core'

import type { MaybeElementRef } from '@vueuse/core'
import type { Ref } from 'vue'

export function useConfirm<T extends (...args: any[]) => void | Promise<void>> (func: T, target?: MaybeElementRef): { fire: (...args: Parameters<T>) => void, fireNext: Ref<boolean> } {
  const fireNext = ref(false)
  const timeout = useTimeoutFn(() => {
    fireNext.value = false
  }, 3000, { immediate: false })

  if (target) {
    onClickOutside(target, () => {
      fireNext.value = false
    })
  }

  return {
    fire (...args) {
      if (fireNext.value) {
        timeout.stop()
        fireNext.value = false
        void func(...args)
        return
      }
      timeout.start()
      fireNext.value = true
    },
    fireNext
  }
}
