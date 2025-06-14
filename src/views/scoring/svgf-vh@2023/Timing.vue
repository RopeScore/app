<template>
  <main class="grid grid-rows-score grid-cols-1">
    <score-button
      color="none"
      label=""
    />

    <score-button
      label="(Re)start"
      class="col-span-2 mx-12"
      :disabled="!!interval.isActive.value || !!scoresheet?.completedAt"
      @click="startTimer()"
    />
    <score-button
      label=""
      color="none"
      :value="tally('seconds')"
    />
    <score-button
      label="Stop"
      color="red"
      class="col-span-2 mx-12"
      :disabled="!interval.isActive.value || !!scoresheet?.completedAt"
      @click="stopTimer()"
    />
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'
import { useIntervalFn } from '@vueuse/core'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'seconds'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

const startTime = ref<number | null>(null)

const interval = useIntervalFn(() => {
  if (startTime.value == null) return

  const marks = scoresheet.value?.marks ?? []
  let prevMark
  for (let idx = marks.length - 1; idx >= 0; idx--) {
    if (marks[idx].schema === 'clear') break
    if (marks[idx].schema === 'seconds') {
      prevMark = marks[idx]
      break
    }
  }

  const time = Math.round((Date.now() - startTime.value) / 1000)
  if (time !== tally('seconds')) {
    if (prevMark) void addMark({ schema: 'undo', target: prevMark.sequence })
    void addMark({ schema: 'seconds', value: time })
  }
}, 100, { immediate: false })

function startTimer () {
  if (interval.isActive.value) return
  startTime.value = Date.now()
  interval.resume()
}

function stopTimer () {
  if (!interval.isActive.value || startTime.value == null) return
  interval.pause()
  const time = Math.round((Date.now() - startTime.value) / 1000)
  void addMark({ schema: 'clear' })
  void addMark({ schema: 'seconds', value: time })
}
</script>
