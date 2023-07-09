<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label="Score"
      :value="result"
      class="col-span-3"
      single-row
    />

    <score-button
      v-for="[schema, level] in levels"
      :key="schema"
      :color="level < 7 ? 'green' : 'indigo'"
      :label="`Level ${level}`"
      :value="tally(schema)"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { Model } from '../../../models'
import type { PropType } from 'vue'

export type Schema = `diffL${'0.5' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

function L (level: number): number {
  if (level === 0) return 0
  return Math.round(Math.pow(1.8, level) * 10) / 100
}

const levels = computed((): Array<[Schema, number]> => [
  ['diffL1', 1],
  ['diffL0.5', 0.5],
  ['diffL4', 4],

  ['diffL2', 2],
  ['diffL7', 7],
  ['diffL5', 5],

  ['diffL3', 3],
  ['diffL8', 8],
  ['diffL6', 6]
])

const result = computed(() => {
  let res = 0
  for (const [schema, level] of levels.value) {
    res += L(level) * tally(schema)
  }
  return res
})
</script>
