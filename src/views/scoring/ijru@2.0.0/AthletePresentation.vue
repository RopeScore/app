<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label=""
      single-row
    />
    <score-button
      label="Score"
      color="none"
      :value="result"
      single-row
    />
    <div class="m-auto text-center" single-row>
      Form/Execution
    </div>

    <score-button
      color="none"
      label=""
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="+"
      :value="tally('formExecutionPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formExecutionPlus' })"
    />

    <score-button
      color="none"
      label=""
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="&#10004;"
      :value="tally('formExecutionCheck')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formExecutionCheck' })"
    />

    <score-button
      label="Misses"
      :value="tally('miss')"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="-"
      :value="tally('formExecutionMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formExecutionMinus' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = `formExecution${'Plus' | 'Check' | 'Minus'}` | 'miss'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const result = computed(() => {
  const plus = tally('formExecutionPlus')
  const check = tally('formExecutionCheck')
  const minus = tally('formExecutionMinus')
  if (plus + check + minus === 0) return 1
  const average = (plus - minus) / (plus + check + minus)
  const percentage = average * (0.60 / 2)
  return (1 + percentage)
})
</script>
