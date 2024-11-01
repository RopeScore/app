<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label="Score"
      :value="result"
      single-row
      class="col-span-3"
    />

    <score-button
      color="indigo"
      class="col-start-1 row-start-2"
      label="Level 1"
      :value="tally('diffL1') + tally('diffL1Plus') + tally('diffL1Minus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'diffL1' })"
    />
    <score-button
      color="indigo"
      class="col-start-1 row-start-3"
      label="Level 2"
      :value="tally('diffL2') + tally('diffL2Plus') + tally('diffL2Minus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'diffL2' })"
    />
    <score-button
      color="indigo"
      class="col-start-1 row-start-4"
      label="Level 3"
      :value="tally('diffL3') + tally('diffL3Plus') + tally('diffL3Minus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'diffL3' })"
    />
    <score-button
      color="indigo"
      class="col-start-3 row-start-2"
      label="Level 4"
      :value="tally('diffL4') + tally('diffL4Plus') + tally('diffL4Minus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'diffL4' })"
    />
    <score-button
      color="indigo"
      class="col-start-3 row-start-3"
      label="Level 5"
      :value="tally('diffL5') + tally('diffL5Plus') + tally('diffL5Minus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'diffL5' })"
    />

    <score-button
      label="-"
      color="red"
      single-row
      :disabled="!!scoresheet?.completedAt || modDisabled"
      class="col-start-3 row-start-4"
      @click="addMark({ schema: 'diffMinus' })"
    />
    <score-button
      v-if="hasBreaks"
      label="Break"
      color="orange"
      :disabled="!!scoresheet?.completedAt"
      :value="tally('break')"
      class="col-start-2 row-start-3"
      @click="addMark({ schema: 'break' })"
    />
    <score-button
      label="+"
      color="green"
      single-row
      :disabled="!!scoresheet?.completedAt || modDisabled"
      class="col-start-2 row-start-4"
      @click="addMark({ schema: 'diffPlus' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { Model } from '../../../models'
import type { PropType } from 'vue'

type DiffBaseSchema = `diffL${1 | 2 | 3 | 4 | 5}`
export type Schema = 'break' | `diff${'Plus' | 'Minus'}` | `${DiffBaseSchema}${'Plus' | 'Minus'}` | DiffBaseSchema

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const judgeType = computed(() => scoresheet.value?.judgeType)
const hasBreaks = computed(() => judgeType.value === 'Dj')

const diffMarkSchemaRegex = /^diffL\d+$/
function isDiffBaseSchema (x: unknown): x is DiffBaseSchema {
  return typeof x === 'string' && diffMarkSchemaRegex.test(x)
}

const modDisabled = computed(() => !isDiffBaseSchema(scoresheet.value?.marks.at(-1)?.schema ?? ''))

function L (level: number): number {
  if (level === 0) return 0
  return Math.round(Math.pow(1.5, level) * 100) / 100
}

const levels = computed(() => ([5, 4, 3, 2, 1] as const).map<Array<[Schema, number]>>(l => [
  [`diffL${l}Plus`, l + 0.5],
  [`diffL${l}`, l],
  [`diffL${l}Minus`, l - 0.25],
]).flat(1))

const result = computed(() => {
  let score = 0
  if (judgeType.value === 'Dj') {
    let numMarks = tally('break')
    for (const [schema, level] of levels.value) {
      score += tally(schema) * L(level)
      numMarks += tally(schema)
    }
    if (score === 0) return 0
    score /= numMarks
  } else {
    let remaining = 20
    for (const [schema, level] of levels.value) {
      const n = tally(schema)
      if (n >= remaining) {
        score += remaining * L(level)
        break
      } else {
        score += n * L(level)
        remaining -= n
      }
    }
    if (score === 0) return 0
    score /= 20
  }
  return score
})
</script>
