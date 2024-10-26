<template>
  <main class="grid grid-cols-1 grid-rows-1">
    <section class="mx-2">
      <vertical-scale
        :label="scoreLabel"
        :value="tally(scoreMark)"
        :disabled="!!scoresheet?.completedAt"
        no-half-point
        :min="0"
        :max="10"
        @update:value="handleUpdate(scoreMark, $event)"
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
        label="Surprise Bonus"
        :value="tally('bonus')"
        :min="0"
        :max="1"
        :hints="['No', 'Yes']"
        :disabled="!!scoresheet?.completedAt"
        @update:value="handleUpdate('bonus', $event)"
      />
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import VerticalScale from '../../../components/VerticalScale.vue'
import HorizontalScale from '../../../components/HorizontalScale.vue'

import type { Model } from '../../../models'
import type { PropType } from 'vue'
import { handleScaleUpdateFactory } from '../../../helpers'

export type Schema = 'jumperScore' | 'turnerScore' | 'expressionScore'
| 'stagingScore' | 'bonus' | 'miss'

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
  switch (Array.isArray(model.value.judgeType) ? model.value.judgeType[0] : model.value.judgeType) {
    case 'J':
      return 'Jumper Score'
    case 'T':
      return 'Turner Score'
    case 'E':
      return 'Expression Score'
    case 'S':
      return 'Staging Score'
    default:
      return 'Score'
  }
})

const scoreMark = computed<Schema>(() => {
  switch (Array.isArray(model.value.judgeType) ? model.value.judgeType[0] : model.value.judgeType) {
    case 'J':
      return 'jumperScore'
    case 'T':
      return 'turnerScore'
    case 'E':
      return 'expressionScore'
    case 'S':
      return 'stagingScore'
    default:
      throw new TypeError('Invalid Judge Type')
  }
})

const handleUpdate = handleScaleUpdateFactory<Schema>(scoresheet, addMark)
</script>
