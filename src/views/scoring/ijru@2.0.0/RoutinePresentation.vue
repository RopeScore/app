<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label="Entertainment"
      single-row
    />
    <score-button
      color="none"
      label="Score"
      :value="result"
      single-row
    />
    <score-button
      color="none"
      label="Musicality"
      single-row
    />

    <score-button
      label="+"
      :value="tally('entertainmentPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entertainmentPlus' })"
    />
    <score-button
      color="none"
      label="Ent Score"
      :value="entertainmentResult"
    />
    <score-button
      label="+"
      :value="tally('musicalityPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicalityPlus' })"
    />

    <score-button
      label="&#10004;"
      :value="tally('entertainmentCheck')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entertainmentCheck' })"
    />
    <score-button
      color="none"
      label="Musicality Score"
      :value="musicalityResult"
    />
    <score-button
      label="&#10004;"
      :value="tally('musicalityCheck')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicalityCheck' })"
    />

    <score-button
      label="-"
      :value="tally('entertainmentMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entertainmentMinus' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="-"
      :value="tally('musicalityMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicalityMinus'})"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = `entertainment${'Plus' | 'Check' | 'Minus'}`
  | `musicality${'Plus' | 'Check' | 'Minus'}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const entertainmentResult = computed(() => {
  const plus = tally('entertainmentPlus')
  const check = tally('entertainmentCheck')
  const minus = tally('entertainmentMinus')
  if (plus + check + minus === 0) return 1
  const average = (plus - minus) / (plus + check + minus)
  const percentage = average * (0.60 / 4)
  return (1 + percentage)
})

const musicalityResult = computed(() => {
  const plus = tally('musicalityPlus')
  const check = tally('musicalityCheck')
  const minus = tally('musicalityMinus')
  if (plus + check + minus === 0) return 1
  const average = (plus - minus) / (plus + check + minus)
  const percentage = average * (0.60 / 4)
  return (1 + percentage)
})

const result = computed(() => {
  return (1 + (musicalityResult.value - 1) + (entertainmentResult.value - 1))
})
</script>
