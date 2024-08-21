<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      label="Break Score"
      color="none"
      :value="bScore"
      single-row
    />
    <score-button
      label="ReqEl Score"
      color="none"
      :value="rqScore"
      single-row
    />
    <score-button
      label="Viol Score"
      color="none"
      :value="vScore"
      single-row
    />

    <template v-if="ongoingMiss">
      <score-button
        color="red"
        label="End Miss"
        class="col-span-3 row-span-3"
        @click="endMiss()"
      />
    </template>
    <template v-else>
      <score-button
        v-if="isDoubleDutch"
        color="none"
        label=""
      />
      <score-button
        v-else
        label="Multiples"
        :value="tally('rqMultiples')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqMultiples' })"
      />

      <score-button
        label="Space Violations"
        color="red"
        :value="tally('spaceViolation')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'spaceViolation' })"
      />

      <score-button
        v-if="isDoubleDutch"
        color="none"
        label=""
      />
      <score-button
        v-else
        label="Wraps / Releases"
        :value="tally('rqWrapsReleases')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqWrapsReleases' })"
      />

      <score-button
        label="Gymnastics / Power"
        :value="tally('rqGymnasticsPower')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqGymnasticsPower' })"
      />

      <score-button
        label="Time Violations"
        color="red"
        :value="tally('timeViolation')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'timeViolation' })"
      />

      <score-button
        v-if="hasInteractions"
        label="Interactions"
        :value="tally('rqInteractions')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqInteractions' })"
      />
      <score-button
        v-else
        color="none"
        label=""
      />

      <score-button
        label="Misses"
        color="red"
        :value="`${misses.small} / ${misses.large}`"
        :disabled="!!scoresheet?.completedAt"
        @click="startMiss()"
      />

      <score-button
        v-if="isDoubleDutch"
        label="Turner Involvement"
        :value="tally('rqTurnerInvolvement')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'rqTurnerInvolvement' })"
      />
      <score-button
        v-else
        color="none"
        label=""
      />

      <score-button
        label="Breaks"
        color="orange"
        :value="tally('break')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'break' })"
      />
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { isClearMark, isUndoMark, useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

const requiredElements = [
  'rqMultiples',
  'rqWrapsReleases',
  'rqGymnasticsPower',
  'rqInteractions',
  'rqTurnerInvolvement'
] as const

export type Schema = typeof requiredElements[number]
| 'missStart' | 'missEnd' | 'timeViolation' | 'spaceViolation' | 'break'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { scoresheet, addMark, tally } = useScoresheet<Schema>()

const lookupCodeParts = computed<string[]>(() => scoresheet.value?.competitionEventId.split('.') ?? [])

const isDoubleDutch = computed(() => lookupCodeParts.value[3] === 'dd')
const hasInteractions = computed(() => parseInt(lookupCodeParts.value[5], 10) > (lookupCodeParts.value[3] === 'dd' ? 3 : 1))

const ongoingMiss = ref(false)
function startMiss () {
  if (ongoingMiss.value) return
  ongoingMiss.value = true
  void addMark({ schema: 'missStart' })
}
function endMiss () {
  if (!ongoingMiss.value) return
  ongoingMiss.value = false
  void addMark({ schema: 'missEnd' })
}

const rqScore = computed(() => {
  let elements = 0
  let completed = 0

  if (isDoubleDutch.value) elements += 2
  else elements += 3
  if (hasInteractions.value) elements += 1

  for (const schema of requiredElements) {
    const done = tally(schema)
    completed += done > 4 ? 4 : done
  }
  return 1 - (((elements * 4) - completed) * 0.025)
})

const bScore = computed(() => {
  const breaks = tally('break')
  if (breaks < 2) return 1
  return 1 - ((breaks - 2) * 0.0125)
})

const misses = computed(() => {
  let marks = scoresheet.value?.marks ?? []

  // TODO: It should really be possible to optimise this but I'm on vacation
  const lastClearMarkIdx = marks.findLastIndex(m => m.schema === 'clear')
  marks = marks
    .slice(lastClearMarkIdx + 1)
    .filter(m => m.schema === 'missStart' || m.schema === 'missEnd' || m.schema === 'undo')

  // Remove undone marks and the undo marks themselves
  for (let idx = marks.length - 1; idx >= 0; idx--) {
    const mark = marks[idx]
    if (isUndoMark(mark)) {
      const undoneMarkIdx = marks.findIndex(m => m.sequence === mark.target)
      const undoneMark = marks[undoneMarkIdx]
      if (!isUndoMark(undoneMark) && !isClearMark(undoneMark)) {
        marks.splice(idx, 1)
        marks.splice(undoneMarkIdx, 1)
        idx--
      }
    }
  }

  const missTimes = []
  // now we should have only missStart and missEnd marks left in alternating
  // order. If a missStart isn't immediately followed by a missEnd, or if we
  // find a lonely missEnd it means either the missStart or missEnd was undone.
  if (marks.length >= 2) {
    for (let idx = 0; idx < marks.length; idx++) {
      const mark = marks[idx]
      const nextMark = marks[idx + 1]
      if (mark.schema === 'missStart' && nextMark?.schema === 'missEnd') {
        missTimes.push(nextMark.timestamp - mark.timestamp)
      }
    }
  }

  let small = 0
  let large = 0
  for (const miss of missTimes) {
    if (miss > 3_000) large++
    else small++
  }

  return {
    small,
    large
  }
})

const vScore = computed(() => {
  const space = tally('spaceViolation')
  const time = tally('timeViolation')

  return 1 - ((space + time + misses.value.small) * 0.025) - (misses.value.large * 0.05)
})

function onUndo () {
  ongoingMiss.value = false
}

defineExpose({
  onUndo,
  onClear: onUndo
})
</script>
