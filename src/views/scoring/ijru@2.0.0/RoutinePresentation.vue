<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="Entertainment" />
    <score-button color="none" :label="'Score: ' + result" />
    <score-button color="none" label="Musicality" />

    <score-button
      label="+"
      :value="entertainment.plus"
      @click="addMark({ fieldId: 'entertainment', value: 1 })"
    />
    <score-button color="none" label="Ent Score" value="0" />
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
    <score-button color="none" label="Musicality Score" value="0" />
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
    <score-button color="none" label="" />
    <score-button
      label="-"
      :value="musicality.minus"
      @click="addMark({ fieldId: 'musicality', value: -1 })"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { mapMutations, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import { Model } from '../../../models'
import { State } from '../../../store'

export default defineComponent({
  name: 'RoutinePresentation',
  components: {
    ScoreButton
  },
  props: {
    model: {
      type: Object as PropType<Model>,
      required: true
    }
  },
  data: () => ({
    result: 0,
  }),
  setup () {
    const store = useStore<State>()

    return {
      entertainment: computed(() => {
        const marks = { plus: 0, check: 0, minus: 0 }

        for (const mark of store.state.scoresheet.currentScoresheet?.marks ?? []) {
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

        for (const mark of store.state.scoresheet.currentScoresheet?.marks ?? []) {
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
