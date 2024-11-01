<template>
  <main
    v-if="step === 'marks'"
    class="grid grid-cols-3"
    :class="{
      'grid-rows-score-five': !scoresheet?.options?.noBoost,
      'grid-rows-score-five-no-boost': !!scoresheet?.options?.noBoost
    }"
  >
    <score-button
      label="Breaks"
      :class="{
        'col-span-5 col-start-1 row-start-1': !scoresheet?.options?.noBoost,
        'row-span-2 col-start-2 row-start-2': !!scoresheet?.options?.noBoost,
      }"
      color="red"
      :value="tally('exp-break')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-break' })"
    />

    <score-button
      label="Musicality -"
      class="row-start-2"
      color="red"
      :value="tally('exp-musicMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicMinus' })"
    />
    <score-button
      label="Form -"
      class="row-start-3"
      color="red"
      :value="tally('exp-formMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formMinus' })"
    />
    <score-button
      label="Creativity -"
      class="row-start-4"
      color="red"
      :value="tally('exp-creaMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaMinus' })"
    />
    <score-button
      label="Entertainment -"
      class="row-start-5"
      color="red"
      :value="tally('exp-entMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entMinus' })"
    />
    <score-button
      label="Repetitive -"
      class="row-start-6"
      color="red"
      :value="tally('exp-varietyMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyMinus' })"
    />

    <score-button
      v-if="!scoresheet?.options?.noBoost"
      label="Boost"
      class="row-span-5 col-start-2 row-start-2"
      color="indigo"
      :value="tally('exp-boost')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-boost' })"
    />

    <score-button
      label="Musicality +"
      class="row-start-2 col-start-3"
      :value="tally('exp-musicPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicPlus' })"
    />
    <score-button
      label="Form +"
      class="row-start-3 col-start-3"
      :value="tally('exp-formPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formPlus' })"
    />
    <score-button
      label="Creativity +"
      class="row-start-4 col-start-3"
      :value="tally('exp-creaPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaPlus' })"
    />
    <score-button
      label="Entertainment +"
      class="row-start-5 col-start-3"
      :value="tally('exp-entPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entPlus' })"
    />
    <score-button
      label="Variety +"
      class="row-start-6 col-start-3"
      :value="tally('exp-varietyPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyPlus' })"
    />

    <score-button
      label="Miss"
      :class="{
        'col-span-5 col-start-1 row-start-7': !scoresheet?.options?.noBoost,
        'row-span-2 col-start-2 row-start-5': !!scoresheet?.options?.noBoost,
      }"
      color="red"
      :value="tally('miss')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />
  </main>

  <main
    v-else-if="step === 'adjust'"
    class="grid grid-cols-4"
    :class="{
      'grid-rows-score-five': !scoresheet?.options?.noBoost,
      'grid-rows-score-five-no-boost': !!scoresheet?.options?.noBoost
    }"
  >
    <score-button
      color="none"
      class="col-span-4"
      label="Score"
      :value="result.toFixed(2)"
      single-row
    />

    <score-button
      label="Musicality -"
      class="row-start-2"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicMinus' })"
    />
    <score-button
      label="Form -"
      class="row-start-3"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formMinus' })"
    />
    <score-button
      label="Creativity -"
      class="row-start-4"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaMinus' })"
    />
    <score-button
      label="Entertainment -"
      class="row-start-5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entMinus' })"
    />
    <score-button
      label="Repetitive -"
      class="row-start-6"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyMinus' })"
    />

    <div
      v-for="component, idx of components"
      :key="component"
      class="col-span-2 col-start-2 flex justify-between items-center"
      :class="`row-start-${2 + idx}`"
    >
      <span>0</span>
      <div class="flex content-center justify-center flex-wrap w-full m-2">
        <div>{{ (componentScore(component) * weights[component] * 10).toFixed(1) }}</div>
        <progress class="w-full" max="10" :value="componentScore(component)" />
      </div>
      <span>{{ weights[component] * 100 }}</span>
    </div>

    <score-button
      label="Musicality +"
      class="row-start-2 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicPlus' })"
    />
    <score-button
      label="Form +"
      class="row-start-3 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formPlus' })"
    />
    <score-button
      label="Creativity +"
      class="row-start-4 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaPlus' })"
    />
    <score-button
      label="Entertainment +"
      class="row-start-5 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entPlus' })"
    />
    <score-button
      label="Variety +"
      class="row-start-6 col-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyPlus' })"
    />

    <score-button
      label=""
      class="col-span-5 col-start-1 row-start-7"
      color="none"
    />
  </main>
</template>

<script lang="ts" setup>
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import { computed, type PropType } from 'vue'
import type { Model } from '../../../models'
import { clamp } from '@vueuse/core'

const components = ['music', 'form', 'crea', 'ent', 'variety'] as const
type Component = typeof components[number]

export type Schema = 'miss' | 'exp-boost' | 'exp-break'
| `exp-${Component}${'Plus' | 'Minus'}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  },
  step: {
    type: String,
    default: null
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const CHANGE = 0.3

function componentScore (type: Component) {
  let score = 5
  for (const mark of scoresheet.value?.marks ?? []) {
    if (mark.schema === `exp-${type}Plus` && score <= 10) score += CHANGE
    else if (mark.schema === `exp-${type}Minus` && score >= 0) score -= CHANGE

    if (mark.schema === 'exp-boost' && mark.schema === `exp-${type}Plus` && score <= 10) score += 0.5 * CHANGE
    else if (mark.schema === 'exp-boost' && mark.schema === `exp-${type}Minus` && score >= 0) score -= 0.5 * CHANGE
  }

  return Math.round(clamp(score, 0, 10) * 10) / 10
}

const weights = computed((): Record<Component, number> => {
  if (scoresheet.value?.options?.w2 === 'Form, Ent 30 / Mus 20 / Crea, Var 10') {
    return {
      music: 0.2,
      form: 0.3,
      ent: 0.3,
      crea: 0.1,
      variety: 0.1
    }
  } else if (scoresheet.value?.options?.w2 === 'Form, Ent 25 / Mus 20 / Crea, Var 15') {
    return {
      music: 0.2,
      form: 0.25,
      ent: 0.25,
      crea: 0.15,
      variety: 0.15
    }
  } else if (scoresheet.value?.options?.w2 === 'Form, Ent 25 / Mus, Crea, Var 17') {
    return {
      music: 1 / 6,
      form: 0.25,
      ent: 0.25,
      crea: 1 / 6,
      variety: 1 / 6
    }
  } else if (scoresheet.value?.options?.w2 === 'Ent 30 / Form 25 / Mus, Cre, Var 15') {
    return {
      music: 0.15,
      form: 0.25,
      crea: 0.15,
      ent: 0.3,
      variety: 0.15
    }
  }

  return {
    music: 0.2,
    form: 0.2,
    ent: 0.2,
    crea: 0.2,
    variety: 0.2
  }
})

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
    sum += componentScores[key] * weights.value[key]
  }

  return Math.round(clamp(sum, 0, 100) * 10)
})
</script>

<style scoped>
.grid-rows-score-five {
  grid-template-rows: 9vh repeat(5, calc((73vh - 2rem) / 5)) 9vh;
}

.grid-rows-score-five-no-boost {
  grid-template-rows: 9vh repeat(5, calc((82vh - 2rem) / 5));
}
</style>
