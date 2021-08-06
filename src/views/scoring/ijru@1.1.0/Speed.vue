<template>
  <main class="grid grid-rows-score grid-cols-2">
    <template v-if="isHeadJudge">
      <score-button
        label="False Starts"
        color="red"
        :value="tally('falseStart')"
        single-row
        @click="addMark({ schema: 'falseStart' })"
      />
      <score-button
        v-if="isHeadJudge"
        label="False Switches"
        color="red"
        :value="tally('falseSwitch')"
        single-row
        @click="addMark({ schema: 'falseSwitch' })"
      />
    </template>
    <template v-else>
      <score-button
        color="none"
        label=""
      />
      <score-button
        color="none"
        label=""
      />
    </template>

    <score-button
      label="Steps"
      :value="tally('step')"
      class="col-span-2 row-span-3 mx-12"
      @click="addMark({ schema: 'step' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type schemas = 'step' | 'falseStart' | 'falseSwitch'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally } = useScoresheet()

const isHeadJudge = computed(() => props.model.judgeType === 'Shj')
</script>
