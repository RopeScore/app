<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      v-if="!confirmExit"
      label="Exit"
      :vibration="500"
      @click="exit()"
    />

    <score-button
      v-if="confirmExit"
      label="Submit"
      @click="exit('submit')"
    />
    <score-button
      v-if="confirmExit"
      label="Discard"
      color="red"
      @click="exit('discard')"
    />

    <score-button
      v-if="!disableUndo && !confirmExit"
      color="orange"
      label="Undo"
      @click="scsh.addMark({ schema: 'undo', target: lastMarkSequence })"
    />
    <score-button
      v-else-if="!confirmExit"
      color="none"
      label=""
    />

    <score-button
      ref="resetRef"
      color="red"
      :label="resetNext ? 'Click Again' : 'Reset'"
      :vibration="resetNext ? 1000 : 500"
      :disabled="!!scsh.scoresheet.value?.submittedAt"
      @click="reset()"
    />
  </nav>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createLocalScoresheet, useScoresheet } from '../hooks/scoresheet'
import { useConfirm } from '../hooks/confirm'
import ScoreButton from './ScoreButton.vue'

const router = useRouter()
const scsh = useScoresheet()

const lastMarkSequence = computed(() => (scsh.scoresheet.value?.marks.length ?? 0) - 1)
const disableUndo = computed(() => {
  if (scsh.scoresheet.value?.completedAt) return true
  const marks = scsh.scoresheet.value?.marks ?? []
  return marks.length === 0 || marks[marks.length - 1]?.schema === 'undo'
})

const resetRef = ref(null)
const { fire: reset, fireNext: resetNext } = useConfirm(async () => {
  if (!scsh.scoresheet.value) return
  const { id, marks, completedAt, openedAt, ...rest } = scsh.scoresheet.value
  await scsh.complete()
  await scsh.close()
  const newId = await createLocalScoresheet(rest)
  router.replace(`/score/local/${newId}`)
}, resetRef)

const { fire: exit, fireNext: confirmExit } = useConfirm(async (mode?: 'submit' | 'discard') => {
  if (mode === 'submit') await scsh.complete()
  await scsh.close(mode === 'submit')
  router.go(-1)
})
</script>
