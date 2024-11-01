<template>
  <main
    v-if="step === 'marks'"
    class="grid grid-cols-5 grid-rows-score-circle"
  >
    <score-button
      label="Breaks"
      class="col-span-5 col-start-1 row-start-1"
      color="red"
      :value="tally('exp-break')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-break' })"
    />

    <score-button
      label="Musicality +"
      class="row-span-2 col-start-1 row-start-4"
      :value="tally('exp-musicPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicPlus' })"
    />
    <score-button
      label="Form +"
      class="row-span-2 col-start-2 row-start-3"
      :value="tally('exp-formPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formPlus' })"
    />
    <score-button
      label="Creativity +"
      class="row-span-2 col-start-3 row-start-2"
      :value="tally('exp-creaPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaPlus' })"
    />
    <score-button
      label="Entertainment +"
      class="row-span-2 col-start-4 row-start-3"
      :value="tally('exp-entPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entPlus' })"
    />
    <score-button
      label="Variety +"
      class="row-span-2 col-start-5 row-start-4"
      :value="tally('exp-varietyPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyPlus' })"
    />

    <score-button
      label="Boost"
      class="row-span-2 col-start-3 row-start-5"
      color="indigo"
      :value="tally('exp-boost')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-boost' })"
    />

    <score-button
      label="Musicality -"
      class="row-span-2 col-start-1 row-start-6"
      color="red"
      :value="tally('exp-musicMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicMinus' })"
    />
    <score-button
      label="Form -"
      class="row-span-2 col-start-2 row-start-7"
      color="red"
      :value="tally('exp-formMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formMinus' })"
    />
    <score-button
      label="Creativity -"
      class="row-span-2 col-start-3 row-start-8"
      color="red"
      :value="tally('exp-creaMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaMinus' })"
    />
    <score-button
      label="Entertainment -"
      class="row-span-2 col-start-4 row-start-7"
      color="red"
      :value="tally('exp-entMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entMinus' })"
    />
    <score-button
      label="Repetitive -"
      class="row-span-2 col-start-5 row-start-6"
      color="red"
      :value="tally('exp-varietyMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyMinus' })"
    />

    <score-button
      label="Miss"
      class="col-span-5 col-start-1 row-start-10"
      color="red"
      :value="tally('miss')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />
  </main>

  <main
    v-else-if="step === 'adjust'"
    class="grid grid-cols-4 grid-rows-adjust"
  >
    <score-button
      label="-0.5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicMinus' })"
    />
    <score-button
      label="Musicality"
      class="col-span-2"
      color="none"
      :value="(tally('exp-musicPlus') - tally('exp-musicMinus')) * factor"
    />
    <score-button
      label="+0.5"
      color="green"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicPlus' })"
    />

    <score-button
      label="-0.5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formMinus' })"
    />
    <score-button
      label="Form/Execution"
      class="col-span-2"
      color="none"
      :value="(tally('exp-formPlus') - tally('exp-formMinus')) * factor"
    />
    <score-button
      label="+0.5"
      color="green"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formPlus' })"
    />

    <score-button
      label="-0.5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaPlus' })"
    />
    <score-button
      label="Creativity"
      class="col-span-2"
      color="none"
      :value="(tally('exp-creaPlus') - tally('exp-creaMinus')) * factor"
    />
    <score-button
      label="+0.5"
      color="green"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaMinus' })"
    />

    <score-button
      label="-0.5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entPlus' })"
    />
    <score-button
      label="Audience Connection/Entertainment"
      class="col-span-2"
      color="none"
      :value="(tally('exp-entPlus') - tally('exp-entMinus')) * factor"
    />
    <score-button
      label="+0.5"
      color="green"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-entMinus' })"
    />

    <score-button
      label="-0.5"
      color="red"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyPlus' })"
    />
    <score-button
      label="Variety/Repetitiveness"
      class="col-span-2"
      color="none"
      :value="(tally('exp-varietyPlus') - tally('exp-varietyMinus')) * factor"
    />
    <score-button
      label="+0.5"
      color="green"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-varietyMinus' })"
    />
  </main>
</template>

<script lang="ts" setup>
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'miss' | 'exp-boost' | 'exp-break'
| `exp-${'music' | 'form' | 'crea' | 'ent' | 'variety'}${'Plus' | 'Minus'}`
| 'exp-creaPlus' | 'exp-audPlus' | 'exp-movPlus' | 'exp-syncMinus'
| 'exp-formMinus' | 'exp-visMinus' | 'exp-varietyMinus'

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

const factor = 0.5

const { addMark, tally, scoresheet } = useScoresheet<Schema>()
</script>

<style scoped>
.grid-rows-score-circle {
  grid-template-rows: 9vh repeat(9, calc((82vh - 2rem) / 9));
}
.grid-rows-adjust {
  grid-template-rows: repeat(5, calc((91vh - 2rem) / 5));
}
</style>
