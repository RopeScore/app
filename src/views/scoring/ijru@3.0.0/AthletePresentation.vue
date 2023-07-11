<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <div v-if="isShow" class="m-auto text-center" single-row>
      Style
    </div>
    <score-button
      v-else
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
      v-if="isShow"
      label="+"
      :value="tally('stylePlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'stylePlus' })"
    />
    <score-button
      v-else
      color="none"
      label=""
    />
    <score-button
      v-if="isShow"
      color="none"
      label="Style Score"
      :value="styleResult"
    />
    <score-button
      v-else
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
      v-if="isShow"
      label="&#10004;"
      :value="tally('styleCheck')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'styleCheck' })"
    />
    <score-button
      v-else
      color="none"
      label=""
    />
    <score-button
      v-if="isShow"
      color="none"
      label="Form Score"
      :value="formResult"
    />
    <score-button
      v-else
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
      v-if="isShow"
      label="-"
      :value="tally('styleMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'styleMinus' })"
    />
    <score-button
      v-else
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

export type Schema = `formExecution${'Plus' | 'Check' | 'Minus'}` | `style${'Plus' | 'Check' | 'Minus'}` | 'miss'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const isShow = computed(() => scoresheet.value?.competitionEventId.split('.')[3] === 'ts')

const formResult = computed(() => {
  const plus = tally('formExecutionPlus')
  const check = tally('formExecutionCheck')
  const minus = tally('formExecutionMinus')
  if (plus + check + minus === 0) return 1
  const average = (3 * (plus - minus)) / (plus + check + minus)
  const F = isShow.value ? (0.50 / 4) : (0.60 / 2)
  const percentage = average * F
  return (1 + percentage)
})

const styleResult = computed(() => {
  if (!isShow.value) return 1
  const plus = tally('stylePlus')
  const check = tally('styleCheck')
  const minus = tally('styleMinus')
  if (plus + check + minus === 0) return 1
  const average = (3 * (plus - minus)) / (plus + check + minus)
  const F = (0.50 / 4)
  const percentage = average * F
  return (1 + percentage)
})

const result = computed(() => {
  if (isShow.value) return (1 + (formResult.value - 1) + (styleResult.value - 1))
  else return formResult.value
})
</script>
