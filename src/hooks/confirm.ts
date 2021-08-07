import { ref } from 'vue'
import { onClickOutside, useTimeoutFn } from '@vueuse/core'

import type { MaybeElementRef } from '@vueuse/core'

export function useConfirm (func: (...args: any[]) => any, target?: MaybeElementRef) {
  const fireNext = ref(false)
  const { start, stop } = useTimeoutFn(() => { fireNext.value = false }, 3000, { immediate: false })

  if (target) {
    onClickOutside(target, () => {
      fireNext.value = false
    })
  }

  return {
    fire (...args: any) {
      if (fireNext.value) {
        stop()
        return func(...args)
      }
      start()
      fireNext.value = true
    },
    fireNext
  }
}
