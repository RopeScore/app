<template>
  <aside v-if="notes.length > 0" class="fixed top-0 right-2 left-2 max-h-header h-header overflow-y-hidden z-2000 flex flex-col gap-2">
    <note-card
      v-for="notif of notes"
      :key="notif.id"
      :color="isErrorMessage(notif) ? (notif.type === 'server' ? 'red' : 'orange') : notif.color"
      class="grid grid-cols-[auto,2rem] items-start"
    >
      <p>{{ notif.message }}</p>
      <text-button @click="pop(notif.id)">
        X
      </text-button>
    </note-card>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import useNotifications, { isErrorMessage } from '../hooks/notifications'

import { NoteCard, TextButton } from '@ropescore/components'

const { notifications, pop } = useNotifications()

const notes = computed(() => {
  return notifications.value.slice(0, 1)
})
</script>
