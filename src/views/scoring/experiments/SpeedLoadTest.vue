<template>
  <main class="grid grid-rows-1 grid-rows-score">
    <score-button
      v-if="!ticker.isActive.value"
      label="Start"
      :value="tally('step')"
      class="row-span-4 mx-12"
      :disabled="!!scoresheet?.completedAt"
      @click="ticker.resume()"
    />
    <score-button
      v-else
      label="Stop"
      color="red"
      :value="tally('step')"
      class="row-span-4 mx-12"
      :disabled="!!scoresheet?.completedAt"
      @click="ticker.pause()"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'
import { useIntervalFn } from '@vueuse/core'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'step' | 'falseStart' | 'falseSwitch'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const ticker = useIntervalFn(() => {
  addMark({ schema: 'step' })
}, 280, { immediate: false, immediateCallback: true })
</script>
