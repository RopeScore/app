<template>
  <div>
    <score-navigation />

    <main class="grid grid-cols-3 grid-rows-score">
      <div></div>
      <div class="m-auto">Score: {{ result }}</div>
      <div></div>

      <template v-if="!diffOpen">
        <div v-if="isDoubleDutch"></div>
        <score-button
          v-else
          label="Multiples"
          :value="requiredElements.multiples ?? 0"
          @click="addMark({ fieldId: 'multiples', value: 1 })"
        />

        <score-button
          label="Space Violations"
          color="red"
          :value="spaceViolations"
          @click="addMark({ fieldId: 'spaceViolation', value: 1 })"
        />

        <div v-if="isDoubleDutch"></div>
        <score-button
          v-else
          label="Wraps / Releases"
          :value="requiredElements.wrapsReleases ?? 0"
          @click="addMark({ fieldId: 'wrapsReleases', value: 1 })"
        />


        <score-button
          label="Gymnastics / Power"
          :value="requiredElements.gymnasticsPower ?? 0"
          @click="addMark({ fieldId: 'gymnasticsPower', value: 1 })"
        />

        <score-button
          label="Time Violations"
          color="red"
          :value="timeViolations"
          @click="addMark({ fieldId: 'timeViolation', value: 1 })"
        />

        <score-button
          v-if="hasInteractions"
          label="Interactions"
          :value="requiredElements.interactions ?? 0"
          @click="addMark({ fieldId: 'interactions', value: 1 })"
        />
        <div v-else></div>


        <score-button
          label="Misses"
          color="red"
          :value="misses"
          @click="addMark({ fieldId: 'miss', value: 1 })"
        />

        <score-button
          label="Repeated Skills"
          color="red"
          :value="numRepeatedSkills"
          :vibration="150"
          @click="diffOpen = true"
        />

        <score-button
          v-if="isDoubleDutch"
          label="Turner Involvement"
          :value="requiredElements.turnerInvolvement ?? 0"
          @click="addMark({ fieldId: 'turnerInvolvement', value: 1 })"
        />
        <div v-else></div>
      </template>
      <template v-else>
        <template v-for="level in [null,null,4,null,7,5,3,8,6]" :key="level">
          <score-button
            v-if="level !== null"
            :color="level < 7 ? 'green' : 'indigo'"
            :label="`Level ${level}`"
            :value="repeatedSkills[level.toString()] ?? 0"
            :vibration="150"
            @click="addRepeatedSkill(level)"
          />
          <div v-else></div>
        </template>
      </template>
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { mapMutations, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import ScoreNavigation from '../../../components/ScoreNavigation.vue'
import { State } from '../../../store'

const reqElFields = [
  'multiples', 'wrapsReleases', 'gymnasticsPower',
  'interactions', 'turnerInvolvement'
] as const
type ReqElField = typeof reqElFields[number]

export default defineComponent({
  name: 'RequiredElements',
  components: {
    ScoreButton,
    ScoreNavigation
  },
  setup () {
    const store = useStore<State>()
    const lookupCodeParts = store.state.currentScoresheet?.competitionEventLookupCode.split('.') ?? []

    return {
      isDoubleDutch: computed(() => lookupCodeParts[3] === 'dd'),
      hasInteractions: computed(() => parseInt(lookupCodeParts[5], 10) > (lookupCodeParts[3] === 'dd' ? 3 : 1)),

      misses: computed(() => {
        return store.state.currentScoresheet?.marks.reduce(
          (acc, mark) => acc + (mark.fieldId === 'miss' ? mark.value : 0),
          0
        ) ?? 0
      }),
      timeViolations: computed(() => {
        return store.state.currentScoresheet?.marks.reduce(
          (acc, mark) => acc + (mark.fieldId === 'timeViolation' ? mark.value : 0),
          0
        ) ?? 0
      }),
      spaceViolations: computed(() => {
        return store.state.currentScoresheet?.marks.reduce(
          (acc, mark) => acc + (mark.fieldId === 'spaceViolation' ? mark.value : 0),
          0
        ) ?? 0
      }),
      repeatedSkills: computed(() => {
        const marks: { [prop: string]: number } = {}
        for (const mark of store.state.currentScoresheet?.marks ?? []) {
          if (mark.fieldId !== 'repeatedSkill') continue
          marks[mark.value.toString()] = (marks[mark.value.toString()] ?? 0) + 1
        }
        return marks
      }),
      numRepeatedSkills: computed(() => (store.state.currentScoresheet?.marks ?? []).filter(mark => mark.fieldId === 'repeatedSkill').length),
      requiredElements: computed(() => {
        const marks: Partial<Record<ReqElField, number>> = {}
        for (const mark of store.state.currentScoresheet?.marks ?? []) {
          if (!reqElFields.includes(mark.fieldId as any)) continue
          marks[mark.fieldId as ReqElField] = (marks[mark.fieldId as ReqElField] ?? 0) + mark.value
        }
        return marks
      })
    }
  },
  data: () => ({
    diffOpen: false,
    result: 0
  }),
  methods: {
    ...mapMutations(['addMark']),
    addRepeatedSkill (level: number) {
      this.addMark({ fieldId: 'repeatedSkill', value: level })
      this.diffOpen = false
    }
  }
})
</script>
