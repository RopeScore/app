import { type Stoppable, useTimeoutFn } from '@vueuse/core'
import { ref } from 'vue'

export interface ErrorMessage {
  id: string
  message: string
  type: 'server' | 'network'
  code?: string
}
export function isErrorMessage (x: any): x is ErrorMessage { return !!x && 'type' in x }

export interface Notification {
  id: string
  message: string
  color: 'red' | 'orange' | 'green' | 'blue'
}

const notifications = ref<Array<ErrorMessage | Notification>>([])
const timeouts = new Map<string, Stoppable>()

export default function useNotifications () {
  return {
    notifications,
    push: (notif: Omit<ErrorMessage, 'id'> | Omit<Notification, 'id'>) => {
      if (isErrorMessage(notif) && notif.code) {
        const exists = notifications.value.find(e => isErrorMessage(e) && e.code === notif.code)
        if (exists) {
          const timeout = timeouts.get(exists?.id)
          if (timeout?.isPending.value) {
            timeout.stop()
            timeout.start()
            return
          }
        }
      }

      const id = `${Date.now()}${Math.round(Math.random() * 1_000_000)}`
      notifications.value.unshift({
        id,
        ...notif
      })

      timeouts.set(id, useTimeoutFn(() => {
        const errIdx = notifications.value.findIndex(e => e.id === id)
        if (errIdx > -1) notifications.value.splice(errIdx, 1)
        timeouts.delete(id)
      }, 5000))
    },
    pop: (id: Notification['id']) => {
      const errIdx = notifications.value.findIndex(e => e.id === id)
      if (errIdx > -1) notifications.value.splice(errIdx, 1)
      timeouts.get(id)?.stop()
      timeouts.delete(id)
    }
  }
}
