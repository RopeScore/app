<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="Entertainment" />
    <score-button color="none" :label="'Score: ' + result" />
    <score-button color="none" label="Musicality" />

    <score-button
      label="+"
      :value="tally('entertainmentPlus')"
      @click="store.dispatch('addMark', { schema: 'entertainmentPlus' })"
    />
    <score-button color="none" label="Ent Score" :value="entertainmentResult" />
    <score-button
      label="+"
      :value="tally('musicalityPlus')"
      @click="store.dispatch('addMark', { schema: 'musicalityPlus' })"
    />

    <score-button
      label="&#10004;"
      :value="tally('entertainmentCheck')"
      @click="store.dispatch('addMark', { schema: 'entertainmentCheck' })"
    />
    <score-button color="none" label="Musicality Score" :value="musicalityResult" />
    <score-button
      label="&#10004;"
      :value="tally('musicalityCheck')"
      @click="store.dispatch('addMark', { schema: 'musicalityCheck' })"
    />

    <score-button
      label="-"
      :value="tally('entertainmentMinus')"
      @click="store.dispatch('addMark', { schema: 'entertainmentMinus' })"
    />
    <score-button color="none" label="" />
    <score-button
      label="-"
      :value="tally('musicalityMinus')"
      @click="store.dispatch('addMark', { schema: 'musicalityMinus'})"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'

import type { PropType } from 'vue'
import type { Model } from '../../../models'
import type { RootState } from '../../../store'

export type schemas = `entertainment${'Plus' | 'Check' | 'Minus'}`
  | `musicality${'Plus' | 'Check' | 'Minus'}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const store = useStore<RootState>()
const tally = store.getters.tally

const entertainmentResult = computed(() => {
  const plus = tally('entertainmentPlus')
  const check = tally('entertainmentCheck')
  const minus = tally('entertainmentMinus')
  if (plus + check + minus === 0) return 1
  let average = (plus - minus) / (plus + check + minus)
  let percentage = average * (0.60 / 4);
  return Math.round((1 + percentage) * 100) / 100;
})

const musicalityResult = computed(() => {
  const plus = tally('musicalityPlus')
  const check = tally('musicalityCheck')
  const minus = tally('musicalityMinus')
  if (plus + check + minus === 0) return 1
  let average = (plus - minus) / (plus + check + minus)
  let percentage = average * (0.60 / 4);
  return Math.round((1 + percentage) * 100) / 100;
})

const result = computed(() => {
  return (
    Math.round(
      (1 + (musicalityResult.value - 1) + (entertainmentResult.value - 1)) * 100
    ) / 100
  )
})
</script>
