<template>
  <main class="grid grid-rows-[4rem_4rem_4rem_1fr] h-[91vh]">
    <text-field
      v-model="steps"
      type="number"
      label="Steps to count"
    />
    <text-field
      v-model="duration"
      type="number"
      label="Duration to count (seconds)"
    />

    <div v-if="ticker.isActive.value" class="flex content-center justify-center flex-wrap w-full m-2">
      <span>{{ elapsed }}</span>
      <progress class="w-full" :max="duration" :value="elapsed" />
    </div>
    <div v-else />

    <score-button
      v-if="!ticker.isActive.value"
      label="Start"
      :value="tally('step')"
      class="row-span-4 mx-12"
      :disabled="!!scoresheet?.completedAt"
      @click="resume()"
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
import { computed, ref } from 'vue'
import { TextField } from '@ropescore/components'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'
import { useIntervalFn, useTimestamp } from '@vueuse/core'

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

const steps = ref(90)
const duration = ref(30)
const startTime = ref<number>(Date.now())

const time = useTimestamp({ interval: 200 })
const elapsed = computed(() => {
  const t = Math.round((time.value - startTime.value) / 1000)
  if (t >= duration.value) return duration.value
  else return t
})

function resume () {
  startTime.value = Date.now()
  ticker.resume()
}

const ticker = useIntervalFn(() => {
  const expected = Math.floor((Date.now() - startTime.value) * (steps.value / (duration.value * 1000)))
  const current = tally('step')

  if (current >= steps.value) {
    ticker.pause()
    return
  }

  for (let count = current; count < expected; count++) {
    addMark({ schema: 'step' })
  }
}, 50, { immediate: false, immediateCallback: true })
</script>
