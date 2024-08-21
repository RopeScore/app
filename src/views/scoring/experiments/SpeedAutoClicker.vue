<template>
  <main class="grid grid-rows-[4rem_4rem_4rem_1fr] h-[91vh]">
    <text-field
      v-model="steps"
      type="number"
      label="Steps to count"
      :disabled="ticker.isActive.value"
    />
    <text-field
      v-model="duration"
      type="number"
      label="Duration to count (seconds)"
      :disabled="ticker.isActive.value"
    />

    <div v-if="ticker.isActive.value" class="flex content-center justify-center flex-wrap w-full p-2">
      <span>{{ elapsed }}</span>
      <progress class="w-full" :max="duration" :value="elapsed" />
    </div>
    <div v-else />

    <score-button
      v-if="!ticker.isActive.value"
      label="Start"
      :value="tally('step')"
      class="row-span-4 mx-12"
      :disabled="!!scoresheet?.completedAt || !valid"
      @click="resume()"
    />
    <score-button
      v-else
      label="Stop"
      color="red"
      :value="tally('step')"
      class="row-span-4 mx-12"
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

defineProps({
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

const valid = computed(() => Number.isSafeInteger(steps.value) && steps.value > 0 && Number.isSafeInteger(duration.value) && duration.value > 0)

function resume () {
  if (!valid.value) return
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
    void addMark({ schema: 'step' })
  }
}, 50, { immediate: false, immediateCallback: true })
</script>
