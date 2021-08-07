import { ref } from 'vue'
import { onClickOutside, useTimeoutFn } from '@vueuse/core'

import type { MaybeElementRef, FunctionArgs } from '@vueuse/core'
import type { Ref } from 'vue'

export function useConfirm<T extends FunctionArgs> (func: T, target?: MaybeElementRef): { fire: T | ((...args: any[]) => void), fireNext: Ref<boolean> } {
  const fireNext = ref(false)
  const { start, stop } = useTimeoutFn(() => { fireNext.value = false }, 3000, { immediate: false })

  if (target) {
    onClickOutside(target, () => {
      fireNext.value = false
    })
  }

  return {
    fire (...args) {
      if (fireNext.value) {
        stop()
        func(...args)
        return
      }
      start()
      fireNext.value = true
    },
    fireNext
  }
}
