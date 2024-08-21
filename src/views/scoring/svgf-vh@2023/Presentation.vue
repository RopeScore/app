<template>
  <main class="grid grid-cols-1 grid-rows-[9vh,1fr,1fr,1fr,1fr]">
    <score-button
      color="none"
      label="Score"
      :value="result"
      single-row
    />

    <div v-for="field of fields" :key="field[0]" class="mx-2">
      <horizontal-scale
        :label="field[1]"
        :hints="field[2]"
        :value="tally(field[0])"
        :min="1"
        :max="3"
        :disabled="!!scoresheet?.completedAt"
        @update:value="handleUpdate(field[0], $event)"
      />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScoresheet, isUndoMark } from '../../../hooks/scoresheet'

import ScoreButton from '../../../components/ScoreButton.vue'
import HorizontalScale from '../../../components/HorizontalScale.vue'

import type { Model } from '../../../models'
import type { PropType } from 'vue'

export type Schema = 'musicOnBeat' | 'formExecution' | 'impression' | 'miss'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

type Definition = [Schema, string, string[]] | [Schema, string]

const fields: Definition[] = [
  ['musicOnBeat', 'Takt, Repform, Reprytm'],
  ['formExecution', 'Teknik, Spänst'],
  ['impression', 'Presentation, Show'],
  ['miss', 'Missar', ['5 eller fler fel', '3-4 fel', '0-2 fel']]
]

const result = computed(() => {
  const res = fields.map(s => tally(s[0])).reduce((a, b) => a + b, 0)
  return res
})

function handleUpdate (schema: Schema, value: number) {
  const marks = scoresheet.value?.marks ?? []
  let prevMark
  for (let idx = marks.length - 1; idx >= 0; idx--) {
    if (marks[idx].schema === schema) {
      prevMark = marks[idx]
      break
    }
  }

  if (prevMark) {
    let isUndone = false
    for (let idx = marks.length - 1; idx >= 0; idx--) {
      const mark = marks[idx]
      if (isUndoMark(mark) && mark.target === prevMark.sequence) {
        isUndone = true
        break
      }
      if (marks[idx].sequence === prevMark.sequence) break // can't undo earlier than the mark
    }

    if (!isUndone) void addMark({ schema: 'undo', target: prevMark.sequence })
  }

  void addMark({ schema, value })
}
</script>
