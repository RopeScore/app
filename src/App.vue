<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import NotificationCards from './components/NotificationCards.vue'
import { useSW } from './hooks/sw'

const route = useRoute()
const { needRefresh, updateSW } = useSW()
const dialogRef = useTemplateRef('update-dialog')

watch(() => [needRefresh.value, route.meta.disableModals], ([nr, dm]) => {
  if (nr && dm !== true) {
    dialogRef.value?.showModal()
  } else {
    dialogRef.value?.close()
  }
})
</script>

<template>
  <notification-cards />
  <div class="container mx-auto box-border">
    <router-view />
  </div>

  <dialog ref="update-dialog" class="bg-white px-8 pt-4 pb-8 rounded w-full max-w-[60ch]">
    <span class="font-bold">Update required, reload to activate</span>
    <button
      class="block p-2 mt-2 text-center text-lg text-white bg-orange-500 hover:bg-orange-600 rounded hover:outline-none focus:outline-none outline-none w-full"
      @click="updateSW()"
    >
      Reload
    </button>
  </dialog>
</template>

<style>
* {
  box-sizing: border-box;
  user-select: none;
  touch-action: manipulation;
}

.grid-rows-score {
  grid-template-rows: 9vh repeat(3, calc((82vh - 2rem) / 3));
}

.touch-manipulation {
  touch-action: manipulation;
}

.tap-transparent {
  -webkit-tap-highlight-color: transparent;
}
</style>
