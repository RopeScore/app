<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      @click="goBack()"
    />
    <score-button
      v-if="!disableUndo"
      color="orange"
      label="Undo"
      @click="scsh.addMark({ schema: 'undo', target: lastMarkSequence })"
    />
    <score-button
      v-else
      color="none"
      label=""
    />
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
import { useRouter } from 'vue-router'
import { createLocalScoresheet, useScoresheet } from '../hooks/scoresheet'
import ScoreButton from './ScoreButton.vue'

const router = useRouter()
const scsh = useScoresheet()

const lastMarkSequence = computed(() => (scsh.scoresheet.value?.marks.length ?? 0) - 1)
const disableUndo = computed(() => {
  if (scsh.scoresheet.value?.completedAt) return true
  const marks = scsh.scoresheet.value?.marks ?? []
  return marks.length === 0 || marks[marks.length - 1]?.schema === 'undo'
})

const resetNext = ref<null | number>(null)

async function reset () {
  if (!resetNext.value) {
    resetNext.value = window.setTimeout(() => {
      resetNext.value = null
    }, 3000)
    return
  }
  clearTimeout(resetNext.value)
  if (!scsh.scoresheet.value) return
  const { id, marks, completedAt, openedAt, ...rest } = scsh.scoresheet.value
  await scsh.complete()
  await scsh.close()
  const newId = await createLocalScoresheet(rest)
  router.replace(`/score/local/${newId}`)
  resetNext.value = null
}

async function goBack () {
  if (resetNext.value) clearTimeout(resetNext.value)
  await scsh.complete()
  await scsh.close()
  router.go(-1)
}
</script>
