<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      color="none"
      label=""
    />
    <div class="m-auto">
      Score: {{ result }}
    </div>
    <div class="m-auto text-center">
      Form/Execution
    </div>

    <score-button
      color="none"
      label=""
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="+"
      :value="tally('formExecutionPlus')"
      @click="store.dispatch('addMark', { schema: 'formExecutionPlus' })"
    />

    <score-button
      color="none"
      label=""
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="&#10004;"
      :value="tally('formExecutionCheck')"
      @click="store.dispatch('addMark', { schema: 'formExecutionCheck' })"
    />

    <score-button
      label="Misses"
      :value="tally('miss')"
      color="red"
      @click="store.dispatch('addMark', { schema: 'miss' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="-"
      :value="tally('formExecutionMinus')"
      @click="store.dispatch('addMark', { schema: 'formExecutionMinus' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed, defineComponent, defineProps } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useStore } from 'vuex'

import type { PropType } from 'vue'
import type { RootState } from '../../../store'
import type { Model } from '../../../models'

export type schemas = `formExecution${'Plus' | 'Check' | 'Minus'}` | 'miss'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const store = useStore<RootState>()
const tally = store.getters.tally

const result = computed(() => {
  const plus = store.getters.tally('formExecutionPlus')
  const check = store.getters.tally('formExecutionCheck')
  const minus = store.getters.tally('formExecutionMinus')
  if (plus + check + minus === 0) return 1
  const average = (plus - minus) / (plus + check + minus)
  const percentage = average * (0.60 / 2)
  return Math.round((1 + percentage) * 100) / 100
})
</script>
