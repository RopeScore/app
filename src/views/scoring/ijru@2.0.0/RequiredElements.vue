<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="" />
    <div class="m-auto">Score: {{ result }}</div>
    <score-button color="none" label="" />

    <template v-if="!diffOpen">
      <score-button v-if="isDoubleDutch" color="none" label="" />
      <score-button
        v-else
        label="Multiples"
        :value="tally('rqMmultiples')"
        @click="addMark({ schema: 'rqMmultiples' })"
      />

      <score-button
        label="Space Violations"
        color="red"
        :value="tally('spaceViolation')"
        @click="addMark({ schema: 'spaceViolation' })"
      />

      <score-button v-if="isDoubleDutch" color="none" label="" />
      <score-button
        v-else
        label="Wraps / Releases"
        :value="tally('rqWrapsReleases')"
        @click="addMark({ schema: 'rqWrapsReleases' })"
      />


      <score-button
        label="Gymnastics / Power"
        :value="tally('rqGymnasticsPower')"
        @click="addMark({ schema: 'rqGymnasticsPower' })"
      />

      <score-button
        label="Time Violations"
        color="red"
        :value="tally('timeViolation')"
        @click="addMark({ schema: 'timeViolation' })"
      />

      <score-button
        v-if="hasInteractions"
        label="Interactions"
        :value="tally('rqInteractions')"
        @click="addMark({ schema: 'rqInteractions' })"
      />
      <score-button v-else color="none" label="" />


      <score-button
        label="Misses"
        color="red"
        :value="tally('miss')"
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
        @click="addMark({ schema: 'rqTurnerInvolvement' })"
      />
      <score-button v-else color="none" label="" />
    </template>
    <template v-else>
      <template v-for="level in levels" :key="level.schema">
        <score-button
          v-if="level !== null"
          :color="level[1] < 7 ? 'green' : 'indigo'"
          :label="`Level ${level[1]}`"
          :value="tally(level[0])"
          :vibration="150"
          @click="addRepeatedSkill(level[0])"
        />
        <score-button v-else color="none" label="" />
      </template>
    </template>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { mapActions, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import type { Model } from '../../../models'
import type { RootState } from '../../../store'

export type schemas = 'rqMultiples' | 'rqWrapsReleases' | 'rqGymnasticsPower'
  | 'rqInteractions' | 'rqTurnerInvolvement'
  | `repL${3 | 4 | 5 | 6 | 7 | 8}`
  | 'miss' | 'timeViolation' | 'spaceViolation'

export default defineComponent({
  name: 'RequiredElements',
  components: {
    ScoreButton
  },
  props: {
    model: {
      type: Object as PropType<Model>,
      required: true
    }
  },
  setup () {
    const store = useStore<RootState>()
    const lookupCodeParts = store.state.scoresheet.currentScoresheet?.competitionEventLookupCode.split('.') ?? []

    const levels = computed((): Array<[schemas, number] | null> => [
      null,
      null,
      ['repL4', 4],

      null,
      ['repL7', 7],
      ['repL5', 5],

      ['repL3', 3],
      ['repL8', 8],
      ['repL6', 6],
    ])

    const requiredElements = computed((): schemas[] => [
      'rqMultiples',
      'rqWrapsReleases',
      'rqGymnasticsPower',
      'rqInteractions',
      'rqTurnerInvolvement'
    ])

    const isDoubleDutch = computed(() => lookupCodeParts[3] === 'dd')
    const hasInteractions = computed(() => parseInt(lookupCodeParts[5], 10) > (lookupCodeParts[3] === 'dd' ? 3 : 1))

    function L (level: number): number {
      if (level === 0) return 0
      return Math.round(Math.pow(1.8, level) * 10) / 100
    }

    return {
      tally: store.getters.tally,
      isDoubleDutch,
      hasInteractions,
      levels,

      numRepeatedSkills: computed(() => levels.value
        .map(level => level ? store.getters.tally(level[0]) : 0)
        .reduce((a, b) => a + b)),
      repeatedSkillsResult: computed(() => {
        let res = 0
        for (let level of levels.value) {
          if (level === null) continue
          res += L(level[1]) * store.getters.tally(level[0])
        }
        return Math.round(res * 100) / 100
      }),
      result: computed(() => {
        let elements = 0
        let completed = 0
        if (isDoubleDutch.value) elements += 2
        else elements += 3

        if (hasInteractions.value) elements += 1

        for (let schema of requiredElements.value) {
          let done = store.getters.tally(schema)
          completed += done > 4 ? 4 : done
        }

        return 1 - (((elements * 4) - completed) * 0.025)
      })
    }
  },
  data: () => ({
    diffOpen: false
  }),
  methods: {
    ...mapActions(['addMark']),
    addRepeatedSkill (schema: schemas) {
      this.addMark({ schema })
      this.diffOpen = false
    }
  }
})
</script>
