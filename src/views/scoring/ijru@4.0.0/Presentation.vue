<template>
  <main
    v-if="step === 'marks'"
    class="grid grid-cols-3 grid-rows-score-five"
  >
      <score-button
      label="Creativity -"
      class="row-start-5"
      color="red"
      :value="tally('creaMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaMinus' })"
    />
        <score-button
      label="Musicality -"
      class="row-start-4"
      color="red"
      :value="tally('musicMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicMinus' })"
    />
    <score-button
      label="Entertainment -"
      class="row-start-2"
      color="red"
      :value="tally('entMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entMinus' })"
    />
    <score-button
      label="Form -"
      class="row-start-3"
      color="red"
      :value="tally('formMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formMinus' })"
    />
    <score-button
      label="Repetitive -"
      class="row-start-6"
      color="red"
      :value="tally('varietyMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'varietyMinus' })"
    />

    <score-button
      label="Creativity +"
      class="row-start-5 col-start-3"
      :value="tally('creaPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaPlus' })"
    />
        <score-button
      label="Musicality +"
      class="row-start-4 col-start-3"
      :value="tally('musicPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicPlus' })"
    />
    <score-button
      label="Entertainment +"
      class="row-start-2 col-start-3"
      :value="tally('entPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entPlus' })"
    />
    <score-button
      label="Form +"
      class="row-start-3 col-start-3"
      :value="tally('formPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formPlus' })"
    />
    <score-button
      label="Variety +"
      class="row-start-6 col-start-3"
      :value="tally('varietyPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'varietyPlus' })"
    />

    <score-button
      label="Miss"
      class="row-span-3 col-start-2 row-start-3"
      color="red"
      :value="tally('miss')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />
  </main>

  <main
    v-else-if="step === 'adjust'"
    class="grid grid-cols-4 grid-rows-score-five"
  >
    <score-button
      color="none"
      class="col-span-2"
      label="Score"
      :value="result.toFixed(1)"
      single-row
    />
    <score-button
      color="none"
      class="col-span-2 col-start-3"
      label="Misses"
      :value="`${tally('miss')} = ${missResult}`"
      single-row
    />

    <score-button
      label="Creativity -"
      class="row-start-5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaMinusAdj' })"
    />
        <score-button
      label="Musicality -"
      class="row-start-4"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicMinusAdj' })"
    />
    <score-button
      label="Entertainment -"
      class="row-start-2"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entMinusAdj' })"
    />
    <score-button
      label="Form -"
      class="row-start-3"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formMinusAdj' })"
    />
    <score-button
      label="Repetitive -"
      class="row-start-6"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'varietyMinusAdj' })"
    />

    <div
      v-for="component, idx of components"
      :key="component"
      class="col-span-2 col-start-2 flex justify-between items-center"
      :class="`row-start-${2 + idx}`"
    >
      <span>0</span>
      <div class="flex content-center justify-center flex-wrap w-full m-2">
        <div>{{ componentScore(component) }}</div>
        <progress class="w-full" max="24" :value="componentScore(component)" />
      </div>
      <span>24</span>
    </div>

    <score-button
      label="Creativity +"
      class="row-start-5 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaPlusAdj' })"
    />
        <score-button
      label="Musicality +"
      class="row-start-4 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicPlusAdj' })"
    />
    <score-button
      label="Entertainment +"
      class="row-start-2 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entPlusAdj' })"
    />
    <score-button
      label="Form +"
      class="row-start-3 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formPlusAdj' })"
    />
    <score-button
      label="Variety +"
      class="row-start-6 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'varietyPlusAdj' })"
    />
  </main>
</template>

<script lang="ts" setup>
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import { computed, type PropType } from 'vue'
import type { Model } from '../../../models'
import { clamp } from '@vueuse/core'

const components = ['crea', 'music', 'ent', 'form', 'variety'] as const
type Component = typeof components[number]

export type Schema = 'miss' | `${Component}${'Plus' | 'Minus'}${'' | 'Adj'}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  },
  step: {
    type: String,
    default: null
  },
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const CHANGE = 1

function componentScore (type: Component) {
  let score = 12

  score += tally(`${type}Plus`) * CHANGE
  score -= tally(`${type}Minus`) * CHANGE
  score -= tally('miss') * CHANGE

  score = Math.round(clamp(score, 0, 24))

  for (const mark of scoresheet.value?.marks ?? []) {
    if (mark.schema === `${type}PlusAdj` && score < 24) score += CHANGE
    else if (mark.schema === `${type}MinusAdj` && score > 0) score -= CHANGE
  }

  return Math.round(clamp(score, 0, 24))
}

const weights = {
  ent: 0.25,
  form: 0.25,
  music: 0.2,
  crea: 0.15,
  variety: 0.15
}

const result = computed(() => {
  const componentScores: Record<Component, number> = {
    music: componentScore('music'),
    form: componentScore('form'),
    ent: componentScore('ent'),
    crea: componentScore('crea'),
    variety: componentScore('variety')
  }
  let sum = 0

  for (const key of components) {
    sum += componentScores[key] * weights[key]
  }

  return Math.round(clamp(sum, 0, 24) * 10) / 10
})

const missResult = computed(() => {
  const misses = tally('miss')
  let result = 1

  if (misses >= 1) result -= 0.05
  if (misses >= 2) result -= 0.075
  if (misses >= 3) result -= 0.1 * (misses - 2)

  return result
})
</script>

<style scoped>
.grid-rows-score-five {
  grid-template-rows: 9vh repeat(5, calc(82vh / 5));
}
</style>
