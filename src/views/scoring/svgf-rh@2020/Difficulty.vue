<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label="Score"
      :value="result"
      class="col-span-3"
      single-row
    />

    <template
      v-for="level, idx in levels"
      :key="level ? level[0] : idx"
    >
      <score-button
        v-if="level !== null"
        color="green"
        :label="`Level ${level[1]}`"
        :value="tally(level[0])"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: level[0] })"
      />
      <score-button
        v-else
        color="none"
        label=""
      />
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { Model } from '../../../models'
import type { PropType } from 'vue'

export type Schema = `diffL${'0.5' | 1 | 2 | 3 | 4 | 5}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

function L (l: number): number {
  if (l === 0) return 0
  return l === 0.5 ? 0.5 : (0.5 * l) + 0.5
}

const levels = computed((): Array<[Schema, number] | null> => [
  ['diffL1', 1],
  ['diffL0.5', 0.5],
  ['diffL4', 4],

  ['diffL2', 2],
  null,
  ['diffL5', 5],

  ['diffL3', 3],
  null,
  null
])

const result = computed(() => {
  let res = 0
  for (const level of levels.value) {
    if (level === null) continue
    res += L(level[1]) * tally(level[0])
  }
  return res
})
</script>
