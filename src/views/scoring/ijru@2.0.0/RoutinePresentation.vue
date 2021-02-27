<template>
  <div>
    <score-navigation />

    <main class="grid grid-cols-3 grid-rows-score">
      <div class="m-auto text-center">Entertainment</div>
      <div class="m-auto">Score: {{ result }}</div>
      <div class="m-auto text-center">Musicality</div>

      <score-button
        label="+"
        :value="entertainment.plus"
        @click="addMark({ fieldId: 'entertainment', value: 1 })"
      />
      <div class="m-auto text-center">Ent Score:<br />0</div>
      <score-button
        label="+"
        :value="musicality.plus"
        @click="addMark({ fieldId: 'musicality', value: 1 })"
      />

      <score-button
        label="&#10004;"
        :value="entertainment.check"
        @click="addMark({ fieldId: 'entertainment', value: 0 })"
      />
      <div class="m-auto text-center">Musicality Score:<br />0</div>
      <score-button
        label="&#10004;"
        :value="musicality.check"
        @click="addMark({ fieldId: 'musicality', value: 0 })"
      />

      <score-button
        label="-"
        :value="entertainment.minus"
        @click="addMark({ fieldId: 'entertainment', value: -1 })"
      />
      <div></div>
      <score-button
        label="-"
        :value="musicality.minus"
        @click="addMark({ fieldId: 'musicality', value: -1 })"
      />
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { mapMutations, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import ScoreNavigation from '../../../components/ScoreNavigation.vue'
import { State } from '../../../store'

export default defineComponent({
  name: 'RoutinePresentation',
    components: {
      ScoreButton,
      ScoreNavigation
    },
    data: () => ({
      result: 0,
    }),
    setup () {
    const store = useStore<State>()

    return {
      entertainment: computed(() => {
        const marks = { plus: 0, check: 0, minus: 0 }

        for (const mark of store.state.currentScoresheet?.marks ?? []) {
          if (mark.fieldId === 'entertainment') {
            if (mark.value === 1) marks.plus += 1
            if (mark.value === 0) marks.check += 1
            if (mark.value === -1) marks.minus += 1
          }
        }

        return marks
      }),
      musicality: computed(() => {
        const marks = { plus: 0, check: 0, minus: 0 }

        for (const mark of store.state.currentScoresheet?.marks ?? []) {
          if (mark.fieldId === 'musicality') {
            if (mark.value === 1) marks.plus += 1
            if (mark.value === 0) marks.check += 1
            if (mark.value === -1) marks.minus += 1
          }
        }

        return marks
      })
    }
  },
  methods: {
    ...mapMutations(['addMark'])
  }
})
</script>
