<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label="Score"
      :value="result"
      class="col-span-3"
      single-row
    />

    <template v-for="field of fields" :key="field[0]">
      <score-button
        color="green"
        :label="field[1]"
        :value="tally(field[0])"
        :selected="tally(field[0]) === 1"
        :disabled="!!scoresheet?.completedAt"
        @click="() => handleUpdate(field[0])"
      />
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScoresheet, isUndoMark } from '../../../hooks/scoresheet'

import ScoreButton from '../../../components/ScoreButton.vue'

import type { Model } from '../../../models'
import type { PropType } from 'vue'

export type Schema = 'rqHighKnee' | 'rqSki' | 'rqTurn' | 'rqPair' | 'rqTool'
  | 'rqBack' | 'rqCross' | 'rqSideJump' | 'rqOutTogether'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

type Definition = [Schema, string]

const fields = computed<Definition[]>(() => {
  const isDD = scoresheet.value?.competitionEventId.split('.')[3] === 'dd'

  if (isDD) {
    return [
      ['rqHighKnee', '4 höga knä'],
      ['rqSki', '4 skidhopp'],
      ['rqTurn', 'Snurra runt'],
      ['rqPair', 'Parövning'],
      ['rqTool', 'Handredskap']
    ]
  } else {
    return [
      ['rqHighKnee', '4 höga knä'],
      ['rqBack', '4 baklänges hopp'],
      ['rqCross', '4 korshopp'],
      ['rqSideJump', '4 sidsväng-hopp'],
      ['rqOutTogether', '4 ut-ihop med benen']
    ]
  }
})

const result = computed(() => {
  const res = fields.value.map(s => tally(s[0])).reduce((a, b) => a + b, 0)
  return 1 - ((5 - res) * 0.1)
})

function handleUpdate (schema: Schema) {
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

    if (!isUndone) {
      void addMark({ schema: 'undo', target: prevMark.sequence })
      return
    }
  }

  void addMark({ schema, value: 1 })
}
</script>
