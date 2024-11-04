<template>
  <main
    v-if="step === 'marks'"
    class="grid grid-cols-3 grid-rows-score-five"
  >
    <score-button
      label="Creativity -"
      class="row-start-2"
      color="red"
      :value="simpleTally.creaMinus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaMinus' })"
    />
    <score-button
      label="Musicality -"
      class="row-start-3"
      color="red"
      :value="simpleTally.musicMinus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicMinus' })"
    />
    <score-button
      label="Entertainment -"
      class="row-start-4"
      color="red"
      :value="simpleTally.entMinus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entMinus' })"
    />
    <score-button
      label="Form -"
      class="row-start-5"
      color="red"
      :value="simpleTally.formMinus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formMinus' })"
    />
    <score-button
      label="Repetitive -"
      class="row-start-6"
      color="red"
      :value="simpleTally.variMinus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'variMinus' })"
    />

    <score-button
      label="Creativity +"
      class="row-start-2 col-start-3"
      :value="simpleTally.creaPlus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaPlus' })"
    />
    <score-button
      label="Musicality +"
      class="row-start-3 col-start-3"
      :value="simpleTally.musicPlus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicPlus' })"
    />
    <score-button
      label="Entertainment +"
      class="row-start-4 col-start-3"
      :value="simpleTally.entPlus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entPlus' })"
    />
    <score-button
      label="Form +"
      class="row-start-5 col-start-3"
      :value="simpleTally.formPlus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formPlus' })"
    />
    <score-button
      label="Variety +"
      class="row-start-6 col-start-3"
      :value="simpleTally.variPlus ?? 0"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'variPlus' })"
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
      class="row-start-2"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaMinusAdj' })"
    />
    <score-button
      label="Musicality -"
      class="row-start-3"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicMinusAdj' })"
    />
    <score-button
      label="Entertainment -"
      class="row-start-4"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entMinusAdj' })"
    />
    <score-button
      label="Form -"
      class="row-start-5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formMinusAdj' })"
    />
    <score-button
      label="Repetitive -"
      class="row-start-6"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'variMinusAdj' })"
    />

    <div
      v-for="component, idx of components"
      :key="component"
      class="col-span-2 col-start-2 flex justify-between items-center"
      :class="`row-start-${2 + idx}`"
    >
      <span>0</span>
      <div class="flex content-center justify-center flex-wrap w-full m-2">
        <div>{{ tally(component) }}</div>
        <progress class="w-full" max="24" :value="tally(component)" />
      </div>
      <span>24</span>
    </div>

    <score-button
      label="Creativity +"
      class="row-start-2 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'creaPlusAdj' })"
    />
    <score-button
      label="Musicality +"
      class="row-start-3 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'musicPlusAdj' })"
    />
    <score-button
      label="Entertainment +"
      class="row-start-4 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'entPlusAdj' })"
    />
    <score-button
      label="Form +"
      class="row-start-5 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'formPlusAdj' })"
    />
    <score-button
      label="Variety +"
      class="row-start-6 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'variPlusAdj' })"
    />
  </main>
</template>

<script lang="ts" setup>
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import { computed, type PropType, ref } from 'vue'
import type { Model } from '../../../models'
import { clamp } from '@vueuse/core'
import { createMarkReducer, type ScoreTally, simpleReducer } from '@ropescore/rulesets'

const components = ['crea', 'music', 'ent', 'form', 'vari'] as const
type Component = typeof components[number]

export type Schema = 'miss' | `${Component}${'Plus' | 'Minus'}${'' | 'Adj'}` | Component

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

const { addMark: _addMark, tally, scoresheet } = useScoresheet<Schema>()

const mr = ref(createMarkReducer(simpleReducer))
const simpleTally = ref<ScoreTally<Schema>>({})

const addMark: typeof _addMark = async (mark) => {
  await _addMark(mark)
  mr.value?.addMark(mark)
  simpleTally.value = mr.value.tally
}

function onClear () {
  mr.value = createMarkReducer(simpleReducer)
  simpleTally.value = mr.value.tally
}

defineExpose({ onClear })

const weights = {
  ent: 0.25,
  form: 0.25,
  music: 0.2,
  crea: 0.15,
  vari: 0.15
}

const result = computed(() => {
  const componentScores: Record<Component, number> = {
    music: tally('music'),
    form: tally('form'),
    ent: tally('ent'),
    crea: tally('crea'),
    vari: tally('vari')
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
  grid-template-rows: 9vh repeat(5, calc((82vh - 2rem) / 5));
}
</style>
