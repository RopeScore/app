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
        @click="store.dispatch('addMark', { schema: 'rqMultiples' })"
      />

      <score-button
        label="Space Violations"
        color="red"
        :value="tally('spaceViolation')"
        @click="store.dispatch('addMark', { schema: 'spaceViolation' })"
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
        @click="store.dispatch('addMark', { schema: 'rqWrapsReleases' })"
      />

      <score-button
        label="Gymnastics / Power"
        :value="tally('rqGymnasticsPower')"
        @click="store.dispatch('addMark', { schema: 'rqGymnasticsPower' })"
      />

      <score-button
        label="Time Violations"
        color="red"
        :value="tally('timeViolation')"
        @click="store.dispatch('addMark', { schema: 'timeViolation' })"
      />

      <score-button
        v-if="hasInteractions"
        label="Interactions"
        :value="tally('rqInteractions')"
        @click="store.dispatch('addMark', { schema: 'rqInteractions' })"
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
        @click="store.dispatch('addMark', { schema: 'miss' })"
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
        @click="store.dispatch('addMark', { schema: 'rqTurnerInvolvement' })"
      />
      <score-button
        v-else
        color="none"
        label=""
      />
    </template>
    <template v-else>
      <template
        v-for="(level, idx) in levels"
        :key="level ? level[0] : idx"
      >
        <score-button
          v-if="level !== null"
          :color="level[1] < 7 ? 'green' : 'indigo'"
          :label="`Level ${level[1]}`"
          :value="tally(level[0])"
          :vibration="150"
          @click="addRepeatedSkill(level[0])"
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
import { computed, ref, defineProps } from 'vue'
import { useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'

import type { PropType } from 'vue'
import type { Model } from '../../../models'
import type { RootState } from '../../../store'

export type schemas = 'rqMultiples' | 'rqWrapsReleases' | 'rqGymnasticsPower'
  | 'rqInteractions' | 'rqTurnerInvolvement'
  | `repL${3 | 4 | 5 | 6 | 7 | 8}`
  | 'miss' | 'timeViolation' | 'spaceViolation'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const store = useStore<RootState>()
const tally = store.getters.tally
const lookupCodeParts = computed(() => store.getters.currentScoresheet?.competitionEventLookupCode.split('.') ?? [])
const diffOpen = ref(false)

const levels = [
  null,
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
const hasInteractions = computed(() => parseInt(lookupCodeParts.value[5], 10) > (lookupCodeParts.value[3] === 'dd' ? 3 : 1))

function L (level: number): number {
  if (level === 0) return 0
  return Math.round(Math.pow(1.8, level) * 10) / 100
}

const numRepeatedSkills = computed(() => levels
  .map(level => level ? store.getters.tally(level[0]) : 0)
  .reduce((a, b) => a + b))

const repeatedSkillsResult = computed(() => {
  let res = 0
  for (const level of levels) {
    if (level === null) continue
    res += L(level[1]) * store.getters.tally(level[0])
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
    const done = store.getters.tally(schema)
    completed += done > 4 ? 4 : done
  }

  return 1 - (((elements * 4) - completed) * 0.025)
})

function addRepeatedSkill (schema: schemas) {
  store.dispatch('addMark', { schema })
  diffOpen.value = false
}
</script>
