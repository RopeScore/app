<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      label="Score"
      color="none"
      :value="result"
      single-row
      class="col-span-3"
    />

    <score-button
      label="Space Violations"
      color="red"
      class="col-start-2 row-start-2"
      :value="tally('spaceViolation')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'spaceViolation' })"
    />

    <score-button
      label="Time Violations"
      color="red"
      class="col-start-2 row-start-3"
      :value="tally('timeViolation')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'timeViolation' })"
    />

    <score-button
      label="Misses"
      color="red"
      class="col-start-1 row-start-4"
      :value="tally('miss')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />

    <score-button
      label="Breaks"
      color="orange"
      class="col-start-3 row-start-4"
      :value="tally('break')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'break' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'timerStart' | 'timerStop' | 'miss' | 'break' | 'timeViolation' | 'spaceViolation'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  },
  step: {
    type: String,
    default: null
  },
})

const { scoresheet, addMark, tally } = useScoresheet<Schema>()

const lookupCodeParts = computed<string[]>(() => scoresheet.value?.competitionEventId.split('.') ?? [])

const isDoubleDutch = computed(() => lookupCodeParts.value[3] === 'dd')
const isShow = computed(() => lookupCodeParts.value[3] === 'ts')
const hasInteractions = computed(() => parseInt(lookupCodeParts.value[5] as string, 10) > (lookupCodeParts.value[3] === 'dd' ? 3 : 1))

const lastStart = computed(() => {
  const startMarkIdx = scoresheet.value?.marks.findLastIndex(m => m.schema === 'timerStart') ?? -1
  const clearMarkIdx = scoresheet.value?.marks.findLastIndex(m => m.schema === 'clear') ?? -1
  if (startMarkIdx > clearMarkIdx) return scoresheet.value?.marks[startMarkIdx]
})

const lastStop = computed(() => {
  if (lastStart.value == null) return
  const stopMarkIdx = scoresheet.value?.marks.findLastIndex(m => m.schema === 'timerStop') ?? -1
  if (stopMarkIdx > lastStart.values.sequence) return scoresheet.value?.marks[startMarkIdx]
})

const result = computed(() => {
  return 0
})
</script>
