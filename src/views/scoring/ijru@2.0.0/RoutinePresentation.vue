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
    <score-button color="none" label="Ent Score" :value="entertainmentResult" />
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
    <score-button color="none" label="Musicality Score" :value="musicalityResult" />
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
import { RootState } from '../../../store'

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
  setup () {
    const store = useStore<RootState>()

    const entertainment = computed(() => {
      const marks = { plus: 0, check: 0, minus: 0 }

      for (const mark of store.state.scoresheet.currentScoresheet?.marks ?? []) {
        if (mark.fieldId === 'entertainment') {
          if (mark.value === 1) marks.plus += 1
          if (mark.value === 0) marks.check += 1
          if (mark.value === -1) marks.minus += 1
        }
      }

      return marks
    })

    const entertainmentResult = computed(() => {
      const { plus, check, minus } = entertainment.value
      if (plus + check + minus === 0) return 1
      let average = (plus - minus) / (plus + check + minus)
      let percentage = average * (0.60 / 4);
      return Math.round((1 + percentage) * 100) / 100;
    })

    const musicality = computed(() => {
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

    const musicalityResult = computed(() => {
      const { plus, check, minus } = musicality.value
      if (plus + check + minus === 0) return 1
      let average = (plus - minus) / (plus + check + minus)
      let percentage = average * (0.60 / 4);
      return Math.round((1 + percentage) * 100) / 100;
    })

    return {
      entertainment,
      entertainmentResult,
      musicality,
      musicalityResult,
      result: computed(() => {
        return (
          Math.round(
            (1 + (musicalityResult.value - 1) + (entertainmentResult.value - 1)) * 100
          ) / 100
        )
      })
    }
  },
  methods: {
    ...mapMutations(['addMark'])
  }
})
</script>
