<template>
  <main v-if="isShow" class="grid grid-cols-3 grid-rows-score">
    <score-button
      label="Score"
      color="none"
      :value="result"
      single-row
      class="col-span-3"
    />

    <score-button
      label="Double Dutch"
      :value="tally('rdDoubleDutch')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'rdDoubleDutch' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="Single Rope"
      :value="tally('rdSingleRope')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'rdSingleRope' })"
    />

    <score-button
      label="Long Ropes"
      :value="tally('rdLongRopes')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'rdLongRopes' })"
    />
    <score-button
      label="Time Violations"
      color="red"
      :value="tally('timeViolation')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'timeViolation' })"
    />
    <score-button
      label="Traveller"
      :value="tally('rdTraveller')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'rdTraveller' })"
    />

    <score-button
      label="Misses"
      color="red"
      :value="tally('miss')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'miss' })"
    />
    <score-button
      color="none"
      label=""
    />
    <score-button
      label="Wheel"
      :value="tally('rdWheel')"
      :disabled="!!scoresheet?.completedAt"
      @click="addMark({ schema: 'rdWheel' })"
    />
  </main>

  <main v-else class="grid grid-cols-3 grid-rows-score">
    <score-button
      label="Score"
      color="none"
      :value="result"
      single-row
      class="col-span-3"
    />

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
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import type { PropType } from 'vue'
import type { Model } from '../../../models'

const requiredElements = [
  'rqMultiples',
  'rqWrapsReleases',
  'rqGymnasticsPower',
  'rqInteractions',
  'rqTurnerInvolvement'
] as const

const requiredDisciplines = [
  'rdSingleRope',
  'rdDoubleDutch',
  'rdWheel',
  'rdLongRopes',
  'rdTraveller'
] as const

export type Schema = typeof requiredElements[number]
| typeof requiredDisciplines[number]
| 'miss' | 'timeViolation' | 'spaceViolation'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { scoresheet, addMark, tally } = useScoresheet<Schema>()

const lookupCodeParts = computed(() => scoresheet.value?.competitionEventId.split('.') ?? [])

const isDoubleDutch = computed(() => lookupCodeParts.value[3] === 'dd')
const isShow = computed(() => lookupCodeParts.value[3] === 'ts')
const hasInteractions = computed(() => parseInt(lookupCodeParts.value[5] as string, 10) > (lookupCodeParts.value[3] === 'dd' ? 3 : 1))

const result = computed(() => {
  let elements = 0
  let completed = 0

  if (isDoubleDutch.value) elements += 2
  else elements += 3
  if (hasInteractions.value) elements += 1

  if (isShow.value) elements = requiredDisciplines.length

  if (isShow.value) {
    for (const schema of requiredDisciplines) {
      const done = tally(schema)
      completed += done > 1 ? 1 : done
    }
    return 1 - ((elements - completed) * 0.05)
  } else {
    for (const schema of requiredElements) {
      const done = tally(schema)
      completed += done > 4 ? 4 : done
    }
    return 1 - (((elements * 4) - completed) * 0.025)
  }
})
</script>
