<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label="Score"
      :value="result"
      single-row
      class="col-span-3"
    />

    <template
      v-for="btn in levelButtons"
      :key="btn?.[0]"
    >
      <score-button
        v-if="btn == null"
        label=""
        color="none"
        disabled
      />
      <score-button
        v-else
        color="indigo"
        :label="`Level ${btn?.[1]}`"
        :value="tally(btn?.[0]) + tally(`${btn?.[0]}Plus`) + tally(`${btn?.[0]}Minus`)"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: btn?.[0] })"
      />
    </template>

    <score-button
      label="-"
      color="red"
      single-row
      :disabled="!!scoresheet?.completedAt || modDisabled"
      class="col-start-1 row-start-4"
      @click="addMod('Minus')"
    />
    <score-button
      v-if="hasBreaks"
      label="Break"
      color="orange"
      :disabled="!!scoresheet?.completedAt"
      :value="tally('break')"
      class="col-start-2 row-start-4"
      @click="addMark({ schema: 'break' })"
    />
    <score-button
      label="+"
      color="green"
      single-row
      :disabled="!!scoresheet?.completedAt || modDisabled"
      class="col-start-3 row-start-4"
      @click="addMod('Plus')"
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
export type Schema = 'break' | `${DiffBaseSchema}${'Plus' | 'Minus' | ''}`

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

const levelButtons = computed((): Array<[DiffBaseSchema, number] | null> => [
  ['diffL1', 1],
  ['diffL5', 5],
  ['diffL2', 2],

  ['diffL3', 3],
  null,
  ['diffL4', 4],
])

const levels = computed(() => ([5, 4, 3, 2, 1] as const).map<Array<[Schema, number]>>(l => [
  [`diffL${l}Plus`, l + 0.5],
  [`diffL${l}`, l],
  [`diffL${l}Minus`, l - 0.25],
]).flat(1))

async function addMod (type: 'Plus' | 'Minus') {
  const prevMark = scoresheet.value?.marks.at(-1)
  if (isDiffBaseSchema(prevMark?.schema)) {
    await addMark({ schema: 'undo', target: prevMark.sequence })
    await addMark({ schema: `${prevMark.schema}${type}` })
  }
}

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
