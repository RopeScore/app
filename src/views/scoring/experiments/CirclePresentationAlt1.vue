<template>
  <main
    class="grid grid-cols-5 grid-rows-score-circle"
  >
    <score-button
      label="Music Highlight"
      class="row-span-2 col-start-1 row-start-4"
      :value="tally('exp-musicPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-musicPlus' })"
    />
    <score-button
      label="Creative"
      class="row-span-2 col-start-2 row-start-3"
      :value="tally('exp-creaPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-creaPlus' })"
    />
    <score-button
      label=""
      color="blank"
      class="row-span-2 col-start-3 row-start-2"
    />
    <score-button
      label="Audience Connection"
      class="row-span-2 col-start-4 row-start-3"
      :value="tally('exp-audPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-audPlus' })"
    />
    <score-button
      label="Movement"
      class="row-span-2 col-start-5 row-start-4"
      :value="tally('exp-movPlus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-movPlus' })"
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
      label="Out of Sync"
      class="row-span-2 col-start-1 row-start-6"
      color="red"
      :value="tally('exp-syncMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-syncMinus' })"
    />
    <score-button
      label="Bad Form"
      class="row-span-2 col-start-2 row-start-7"
      color="red"
      :value="tally('exp-formMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-formMinus' })"
    />
    <score-button
      label="Breaks"
      class="row-span-2 col-start-3 row-start-8"
      color="red"
      :value="tally('exp-break')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-break' })"
    />
    <score-button
      label="Bad Visibility"
      class="row-span-2 col-start-4 row-start-7"
      color="red"
      :value="tally('exp-visMinus')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'exp-visMinus' })"
    />
    <score-button
      label="Repetitive"
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
</template>

<script lang="ts" setup>
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'miss' | 'exp-boost' | 'exp-break' | 'exp-musicPlus'
| 'exp-creaPlus' | 'exp-audPlus' | 'exp-movPlus' | 'exp-syncMinus'
| 'exp-formMinus' | 'exp-visMinus' | 'exp-varietyMinus'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()
</script>

<style scoped>
.grid-rows-score-circle {
  grid-template-rows: 9vh repeat(9, calc((82vh - 2rem) / 9));
}
</style>
