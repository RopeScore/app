<template>
  <main
    class="grid grid-cols-3"
    :class="{
      'grid-rows-score-2': !scoresheet?.options?.scale5 && !!scoresheet?.options?.noCheck,
      'grid-rows-score': !scoresheet?.options?.scale5 && !scoresheet?.options?.noCheck,
      'grid-rows-score-4': !!scoresheet?.options?.scale5 && !!scoresheet?.options?.noCheck,
      'grid-rows-score-5': !!scoresheet?.options?.scale5 && !scoresheet?.options?.noCheck
    }"
  >
    <div class="m-auto text-center" single-row>
      Routine
    </div>
    <score-button
      label="Score"
      color="none"
      :value="result"
      single-row
    />
    <div class="m-auto text-center" single-row>
      Athlete
    </div>

    <template v-if="!!scoresheet?.options?.scale5">
      <score-button
        label="++"
        :value="tally('PrDoublePlus')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'PrDoublePlus' })"
      />
      <score-button
        color="none"
        label=""
      />
      <score-button
        label="++"
        :value="tally('PaDoublePlus')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'PaDoublePlus' })"
      />
    </template>

    <score-button
      label="+"
      :value="tally('PrPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'PrPlus' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="+"
      :value="tally('PaPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'PaPlus' })"
    />

    <template v-if="!scoresheet?.options?.noCheck">
      <score-button
        label="&#10004;"
        :value="tally('PrCheck')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'PrCheck' })"
      />
      <score-button
        color="none"
        label=""
      />
      <score-button
        label="&#10004;"
        :value="tally('PaCheck')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'PaCheck' })"
      />
    </template>

    <score-button
      label="-"
      :value="tally('PrMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'PrMinus' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="-"
      :value="tally('PaMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'PaMinus' })"
    />

    <template v-if="!!scoresheet?.options?.scale5">
      <score-button
        label="--"
        :value="tally('PrDoubleMinus')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'PrDoubleMinus' })"
      />
      <score-button
        color="none"
        label=""
      />
      <score-button
        label="--"
        :value="tally('PaDoubleMinus')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'PaDoubleMinus' })"
      />
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type schemas = `${'Pa' | 'Pr'}${'DoublePlus' | 'Plus' | 'Check' | 'Minus' | 'DoubleMinus'}`

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet()

const routineResult = computed(() => {
  const doublePlus = tally('PrDoublePlus')
  const plus = tally('PrPlus')
  const check = tally('PrCheck')
  const minus = tally('PrMinus')
  const doubleMinus = tally('PrDoubleMinus')
  if (doublePlus + plus + check + minus + doubleMinus === 0) return 1
  let average
  if (scoresheet.value?.options?.scale5) {
    average = (doublePlus + (0.5 * plus) - (0.5 * minus) - doubleMinus) / (doublePlus + plus + check + minus + doubleMinus)
  } else {
    average = (plus - minus) / (plus + check + minus)
  }
  const percentage = average * (0.60 / 2)
  return (1 + percentage)
})

const athleteResult = computed(() => {
  const doublePlus = tally('PaDoublePlus')
  const plus = tally('PaPlus')
  const check = tally('PaCheck')
  const minus = tally('PaMinus')
  const doubleMinus = tally('PaDoubleMinus')
  if (doublePlus + plus + check + minus + doubleMinus === 0) return 1
  let average
  if (scoresheet.value?.options?.scale5) {
    average = (doublePlus + (0.5 * plus) - (0.5 * minus) - doubleMinus) / (doublePlus + plus + check + minus + doubleMinus)
  } else {
    average = (plus - minus) / (plus + check + minus)
  }
  const percentage = average * (0.60 / 2)
  return (1 + percentage)
})

const result = computed(() => {
  return (1 + (routineResult.value - 1) + (athleteResult.value - 1))
})
</script>

<style scoped>
.grid-rows-score-2 {
  grid-template-rows: 9vh repeat(2, calc((82vh - 2rem) / 2));
}
.grid-rows-score-4 {
  grid-template-rows: 9vh repeat(4, calc((82vh - 2rem) / 4));
}
.grid-rows-score-5 {
  grid-template-rows: 9vh repeat(5, calc((82vh - 2rem) / 5));
}
</style>
