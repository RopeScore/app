<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button @click="goBack()" label="Back" />
    <score-button v-if="!disableUndo" @click="store.dispatch('addMark', { schema: 'undo', target: lastMarkSequence })" color="orange" label="Undo" />
    <score-button v-else color="none" label="" />
    <score-button
      color="red"
      :label="resetNext ? 'Click Again' : 'Reset'"
      :vibration="resetNext ? 1000 : 500"
      @click="reset()"
    />
  </nav>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ScoreButton from './ScoreButton.vue'

import type { RootState } from '../store'

const router = useRouter()
const store = useStore<RootState>()
const lastMarkSequence = computed(() => store.getters.currentScoresheet?.marks.length - 1)
const disableUndo = computed(() => {
  const marks = store.getters.currentScoresheet?.marks ?? []
  return marks.length > 0 && marks[marks.length - 1]?.schema === 'undo'
})

const resetNext = ref<null | number>(null)

async function reset () {
  if (!resetNext.value) {
    resetNext.value = setTimeout(() => {
      resetNext.value = null
    }, 3000)
    return
  }
  clearTimeout(resetNext.value)
  if (!store.getters.currentScoresheet) return
  const { id, marks, completedAt, openedAt, ...rest } = store.getters.currentScoresheet
  const scoresheetId = await store.dispatch('createLocalScoresheet', rest)
  store.commit('completeOpenScoresheet')
  await store.dispatch('saveCurrentScoresheet')
  router.replace(`/score/${scoresheetId}`)
  resetNext.value = null
}

async function goBack () {
  if (resetNext.value) clearTimeout(resetNext.value)
  store.commit('completeOpenScoresheet')
  await store.dispatch('saveCurrentScoresheet')
  router.go(-1)
}
</script>
