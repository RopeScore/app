<template>
  <main
    class="grid grid-cols-5 grid-rows-score-circle"
  >
    <score-button
      v-if="!!scoresheet?.options?.overallImpression"
      class="col-span-5"
      :label="`${ovImpOpen ? 'Close' : 'Open'} Overall Impression`"
      color="indigo"
      single-row
      @click="ovImpOpen = !ovImpOpen"
    />
    <score-button
      v-else
      class="col-span-5"
      label=""
      color="none"
      single-row
    />

    <template v-if="ovImpOpen">
      <vertical-scale
        class="col-span-5 row-span-8"
        label="Overall Impression"
        :hints="impression"
        :value="tally('exp-ovimp')"
        :min="0"
        :max="10"
        no-half-point
        :disabled="!!scoresheet?.completedAt"
        @update:value="handleUpdate('exp-ovimp', $event)"
      />
    </template>
    <template v-else>
      <score-button
        label="Music Highlight"
        class="row-span-2 col-start-1 row-start-4"
        :value="tally('exp-plus1')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-plus1' })"
      />
      <score-button
        label="Excellent Form"
        class="row-span-2 col-start-2 row-start-3"
        :value="tally('exp-plus2')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-plus2' })"
      />
      <score-button
        label="Something WOW!!"
        class="row-span-2 col-start-3 row-start-2"
        :value="tally('exp-plus3')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-plus3' })"
      />
      <score-button
        label="Audience Connection"
        class="row-span-2 col-start-4 row-start-3"
        :value="tally('exp-plus4')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-plus4' })"
      />
      <score-button
        label="High Variety"
        class="row-span-2 col-start-5 row-start-4"
        :value="tally('exp-plus5')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-plus5' })"
      />

      <score-button
        label="Eh."
        class="row-span-2 col-start-3 row-start-5"
        color="indigo"
        :value="tally('exp-check')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-check' })"
      />

      <score-button
        label="Out of Sync"
        class="row-span-2 col-start-1 row-start-6"
        color="red"
        :value="tally('exp-minus1')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-minus1' })"
      />
      <score-button
        label="Terrible Form"
        class="row-span-2 col-start-2 row-start-7"
        color="red"
        :value="tally('exp-minus2')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-minus2' })"
      />
      <score-button
        label="Bad ropes/landing"
        class="row-span-2 col-start-3 row-start-8"
        color="red"
        :value="tally('exp-minus3')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-minus3' })"
      />
      <score-button
        label="Bad show"
        class="row-span-2 col-start-4 row-start-7"
        color="red"
        :value="tally('exp-minus4')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-minus4' })"
      />
      <score-button
        label="Repetitiveness"
        class="row-span-2 col-start-5 row-start-6"
        color="red"
        :value="tally('exp-minus5')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'exp-minus5' })"
      />

      <score-button
        label="Miss"
        class="col-span-5 col-start-1 row-start-10"
        color="red"
        :value="tally('miss')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'miss' })"
      />
    </template>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import VerticalScale from '../../../components/VerticalScale.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'
import { handleScaleUpdateFactory } from '../../../helpers'

export type Schema = 'miss' | 'exp-ovimp' | `exp-${'minus' | 'plus'}${1 | 2 | 3 | 4 | 5}` | 'exp-check'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const ovImpOpen = ref(false)
const impression: string[] = []
impression[0] = 'Boring without engagement, happiness, or variation.'
impression[3] = 'Sometimes enjoyable skipping, some variety of skills.'
impression[7] = 'Mostly enjoyable skipping with variation.'
impression[10] = 'Very enjoyable skipping. Happiness and variation.'

const handleUpdate = handleScaleUpdateFactory<Schema>(scoresheet, addMark)
</script>

<style scoped>
.grid-rows-score-circle {
  grid-template-rows: 9vh repeat(9, calc(82vh / 9));
}
</style>
