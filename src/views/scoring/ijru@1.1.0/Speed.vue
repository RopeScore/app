<template>
  <main class="grid grid-rows-score grid-cols-3">
    <score-button
      v-if="isHeadJudge"
      label="False Starts"
      color="red"
      :value="tally('falseStart')"
      single-row
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'falseStart' })"
    />
    <score-button
      v-else
      color="none"
      label=""
    />

    <score-button
      v-if="scoresheet?.options?.minusButton"
      label="Remove Step"
      color="red"
      single-row
      :disabled="!!scoresheet?.completedAt || tally('step') <= 0"
      @click="addMark({ schema: 'step', value: -1 })"
    />
    <score-button
      v-else
      color="none"
      label=""
    />

    <score-button
      v-if="isHeadJudge && hasSwitches"
      label="False Switches"
      color="red"
      :value="tally('falseSwitch')"
      single-row
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'falseSwitch' })"
    />
    <score-button
      v-else
      color="none"
      label=""
    />

    <score-button
      label="Steps"
      :value="tally('step')"
      class="col-span-3 row-span-3 mx-12"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'step' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'step' | 'falseStart' | 'falseSwitch'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const isHeadJudge = computed(() => scoresheet.value?.judgeType === 'Shj')
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const hasSwitches = computed(() => (scoresheet.value?.options?.falseSwitches ?? 0) > 0 || /\.\d+x\d+(@.*)?$/.test(scoresheet.value?.competitionEventId ?? ''))
</script>
