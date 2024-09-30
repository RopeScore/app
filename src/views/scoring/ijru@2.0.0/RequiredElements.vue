<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button
      label="Score"
      color="none"
      :value="result"
      single-row
      class="col-span-3"
    />

    <template v-if="!diffOpen">
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
        :value="tally('miss')"
        :disabled="!!scoresheet?.completedAt"
        @click="addMark({ schema: 'miss' })"
      />

      <score-button
        label="Repeated Skills"
        color="red"
        :value="`${numRepeatedSkills} (-${repeatedSkillsResult})`"
        :vibration="150"
        @click="diffOpen = true"
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
    </template>
    <template v-else>
      <template
        v-for="level, idx in levels"
        :key="level ? level[0] : idx"
      >
        <score-button
          v-if="level !== null && level !== 'close'"
          :color="level[1] < 7 ? 'green' : 'indigo'"
          :label="`Level ${level[1]}`"
          :value="tally(level[0])"
          :vibration="150"
          :disabled="!!scoresheet?.completedAt"
          @click="addRepeatedSkill(level[0])"
        />
        <score-button
          v-else-if="level === 'close'"
          label="Close"
          color="orange"
          @click="diffOpen = false"
        />
        <score-button
          v-else
          color="none"
          label=""
        />
      </template>
    </template>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

export type Schema = 'rqMultiples' | 'rqWrapsReleases' | 'rqGymnasticsPower'
| 'rqInteractions' | 'rqTurnerInvolvement'
| `repL${3 | 4 | 5 | 6 | 7 | 8}`
| 'miss' | 'timeViolation' | 'spaceViolation'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { scoresheet, addMark, tally } = useScoresheet<Schema>()

const lookupCodeParts = computed(() => scoresheet.value?.competitionEventId.split('.') ?? [])
const diffOpen = ref(false)

const levels = [
  'close',
  null,
  ['repL4', 4],

  null,
  ['repL7', 7],
  ['repL5', 5],

  ['repL3', 3],
  ['repL8', 8],
  ['repL6', 6]
] as const

const requiredElements = [
  'rqMultiples',
  'rqWrapsReleases',
  'rqGymnasticsPower',
  'rqInteractions',
  'rqTurnerInvolvement'
] as const

const isDoubleDutch = computed(() => lookupCodeParts.value[3] === 'dd')
const hasInteractions = computed(() => parseInt(lookupCodeParts.value[5] as string, 10) > (lookupCodeParts.value[3] === 'dd' ? 3 : 1))

function L (level: number): number {
  if (level === 0) return 0
  return Math.round(Math.pow(1.8, level) * 10) / 100
}

const numRepeatedSkills = computed(() => levels
  .map(level => level && level !== 'close' ? tally(level[0]) : 0)
  .reduce((a, b) => a + b))

const repeatedSkillsResult = computed(() => {
  let res = 0
  for (const level of levels) {
    if (level === null || level === 'close') continue
    res += L(level[1]) * tally(level[0])
  }
  return res
})

const result = computed(() => {
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

function addRepeatedSkill (schema: Schema) {
  void addMark({ schema })
  diffOpen.value = false
}

function onUndo () {
  diffOpen.value = false
}

defineExpose({
  onUndo,
  onClear: onUndo
})
</script>
