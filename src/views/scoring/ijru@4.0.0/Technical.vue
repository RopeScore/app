<template>
  <main v-if="step === 'timeViolations'" class="grid grid-cols-3 grid-rows-score">
    <score-button
      label="Timer"
      color="none"
      class="col-start-1 row-start-1"
      :value="formatTime(duration)"
      disabled
    />

    <score-button
      label="Time Violations: Was the routine too short?"
      color="none"
      class="col-start-2 col-span-2 row-start-1"
      disabled
    />

    <score-button
      label="Did you start the timer immediately?"
      color="none"
      class="col-start-1 row-start-2 text-red-500"
      disabled
    />
    <score-button
      label="Did you stop the timer immediately?"
      color="none"
      class="col-start-1 row-start-3 text-red-500"
      disabled
    />
    <score-button
      label="The timer is a helper, you are the judge."
      color="none"
      class="col-start-1 row-start-4 text-red-500"
      disabled
    />

    <score-button
      :label="`${formatTime(eventDuration - 10)}&ndash;${formatTime(eventDuration - 6)}`"
      color="red"
      class="col-start-2 row-start-2"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'timeViolation', value: 4 })"
    />
    <score-button
      :label="`${formatTime(eventDuration - 15)}&ndash;${formatTime(eventDuration - 11)}`"
      color="red"
      class="col-start-2 row-start-3"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'timeViolation', value: 8 })"
    />
    <score-button
      :label="`0:00&ndash;${formatTime(eventDuration - 16)}`"
      color="red"
      class="col-start-2 row-start-4"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'timeViolation', value: 12 })"
    />

    <score-button
      label="Total Time Violations"
      color="none"
      class="col-start-3 row-start-4"
      :value="tally('timeViolation')"
      disabled
    />
  </main>

  <main v-else class="grid grid-cols-3 grid-rows-score">
    <score-button
      v-if="lastStartMark == null"
      label="Start Timer"
      color="green"
      class="col-start-1 row-start-1"
      :value="formatTime(duration)"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'resumeTimer' })"
    />
    <score-button
      v-else
      label="Pause Timer"
      color="orange"
      class="col-start-1 row-start-1"
      :value="formatTime(duration)"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'pauseTimer' })"
    />
    <score-button
      label="Reset Timer"
      color="red"
      class="col-start-2 row-start-1"
      :disabled="!!scoresheet?.completedAt || duration === 0"
      @click="addMark({ schema: 'resetTimer' })"
    />

    <score-button
      label="Space Violations"
      color="red"
      class="col-start-2 row-start-2"
      :value="tally('spaceViolation')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'spaceViolation' })"
    />
    <score-button
      label="Time Violations"
      color="red"
      class="col-start-2 row-start-3"
      :value="tally('timeViolation')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'timeViolation' })"
    />

    <score-button
      label="Misses"
      color="red"
      class="col-start-1 row-start-4"
      :value="tally('miss')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />
    <score-button
      v-if="cEvtDef?.discipline !== 'dd'"
      label="Breaks"
      color="orange"
      class="col-start-3 row-start-4"
      :value="tally('break')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'break' })"
    />

    <score-button
      v-if="cEvtDef?.discipline === 'sr' && cEvtDef.numParticipants > 1"
      label="Pairs Interactions"
      class="col-start-1 row-start-2"
      :value="tally('rqInteractions')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'rqInteractions' })"
    />

    <template v-if="cEvtDef?.discipline === 'wh'">
      <score-button
        label="Partner Interactions"
        class="col-start-1 row-start-2"
        :value="tally('rqInteractions')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqInteractions' })"
      />
      <score-button
        label="Rope Manipulation"
        class="col-start-3 row-start-2"
        :value="tally('rqRopeManipulation')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqRopeManipulation' })"
      />
      <score-button
        label="Gymnastics / Power"
        class="col-start-1 row-start-3"
        :value="tally('rqGymnasticsPower')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqGymnasticsPower' })"
      />
      <score-button
        label="Multiples"
        class="col-start-3 row-start-3"
        :value="tally('rqMultiples')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqMultiples' })"
      />
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet, type Mark } from '../../../hooks/scoresheet'
import { useIntervalFn } from '@vueuse/core'

import type { PropType } from 'vue'
import type { Model } from '../../../models'
import { parseCompetitionEventDefinition } from '@ropescore/rulesets'

export type Schema = 'resumeTimer' | 'pauseTimer' | 'resetTimer' |
  'miss' | 'break' | 'timeViolation' | 'spaceViolation' |
  'rqInteractions' | 'rqRopeManipulation' | 'rqMultiples' | 'rqGymnasticsPower'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  },
  step: {
    type: String,
    default: null
  },
})

const { scoresheet, addMark, tally } = useScoresheet<Schema>()

const cEvtDef = computed(() => scoresheet.value?.competitionEventId == null ? null : parseCompetitionEventDefinition(scoresheet.value.competitionEventId as string))

// here we try to only process new marks without building a wrapper for addMark
// in our component, but also without reprocessing every mark on each new mark
// addition
const lastMarkSequence = ref(-1)
const accumulatedDuration = ref(0)
const lastStartMark = ref<Mark<Schema>>()
const skipMarks = ref<number[]>([])
watch(() => scoresheet.value?.marks, marks => {
  if (marks == null) return
  // handle odd resets
  if (marks.length === 0) {
    lastMarkSequence.value = -1
    accumulatedDuration.value = 0
    lastStartMark.value = undefined
    skipMarks.value = []
    return
  }

  // We don't have any new marks to process
  if (marks.at(-1)?.sequence === lastMarkSequence.value) return

  for (let idx = lastMarkSequence.value + 1; idx < marks.length; idx++) {
    const mark = marks[idx]
    if (skipMarks.value.includes(mark.sequence)) continue

    if (mark.schema === 'pauseTimer') {
      if (lastStartMark.value == null) continue
      accumulatedDuration.value += mark.timestamp - lastStartMark.value.timestamp
      lastStartMark.value = undefined
    } else if (mark.schema === 'clear' || mark.schema === 'resetTimer') {
      accumulatedDuration.value = 0
      lastStartMark.value = undefined
    } else if (mark.schema === 'undo') {
      if (
        marks[mark.target].schema === 'resumeTimer' ||
        marks[mark.target].schema === 'resetTimer' ||
        marks[mark.target].schema === 'pauseTimer'
      ) {
        skipMarks.value.push(mark.target)
        skipMarks.value.push(mark.sequence)
        accumulatedDuration.value = 0
        idx = -1
      }
    } else if (lastStartMark.value == null && props.step !== 'timeViolations') {
      lastStartMark.value = mark
    }

    lastMarkSequence.value = mark.sequence
  }
}, { deep: true })

watch(() => props.step, newStep => {
  if (newStep === 'timeViolations' && lastStartMark.value != null) {
    void addMark({ schema: 'pauseTimer' })
  }
})

const duration = ref(0)
useIntervalFn(() => {
  let d = accumulatedDuration.value
  if (lastStartMark.value != null) {
    d += Date.now() - lastStartMark.value.timestamp
  }
  duration.value = Math.round(d / 100) / 10
}, 100)

const eventDuration = computed(() => cEvtDef.value?.timing.split('x').map(v => parseInt(v, 10)).reduce((a, b) => a * b, 1) ?? 0)

function formatTime (seconds: number) {
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toFixed(0).padStart(2, '0')}`
}
</script>
