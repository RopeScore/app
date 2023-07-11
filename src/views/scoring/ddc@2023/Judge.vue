<template>
  <main class="grid grid-cols-1 grid-rows-1">
    <section class="mx-2">
      <vertical-scale
        :label="scoreLabel"
        :value="tally('score')"
        :disabled="!!scoresheet?.completedAt"
        no-half-point
        :min="0"
        :max="10"
        @update:value="handleUpdate('score', $event)"
      />

      <vertical-scale
        label="Mistakes"
        :value="tally('miss')"
        :disabled="!!scoresheet?.completedAt"
        no-half-point
        :min="0"
        :max="7"
        :hints="missHints"
        @update:value="handleUpdate('miss', $event)"
      />

      <horizontal-scale
        label="Bonus"
        :value="tally('bonus')"
        :min="0"
        :max="1"
        :disabled="!!scoresheet?.completedAt"
        @update:value="handleUpdate('bonus', $event)"
      />
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useScoresheet, isUndoMark, type Mark } from '../../../hooks/scoresheet'

import VerticalScale from '../../../components/VerticalScale.vue'
import HorizontalScale from '../../../components/HorizontalScale.vue'

import type { Model } from '../../../models'
import type { PropType } from 'vue'

export type Schema = 'score' | 'bonus' | 'miss'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const model = toRef(props, 'model')

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const missHints: string[] = []
missHints[0] = '(no-miss bonus)'
missHints[7] = '(or more)'

const scoreLabel = computed(() => {
  switch (model.value.judgeType) {
    case 'J':
      return 'Jumper Score'
    case 'T':
      return 'Turner Score'
    case 'E':
      return 'Expression Score'
    case 'S':
      return 'Styling Score'
    default:
      return 'Score'
  }
})

function handleUpdate (schema: Schema, value: number) {
  const marks = scoresheet.value?.marks ?? []
  let prevMark: Mark<Schema> | undefined
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

    if (!isUndone) addMark({ schema: 'undo', target: prevMark.sequence })
  }

  addMark({ schema, value })
}
</script>
