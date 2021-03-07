<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="" />
    <div class="m-auto">Score: {{ result }}</div>
    <div class="m-auto text-center">Form/Execution</div>

    <score-button color="none" label="" />
    <score-button color="none" label="" />
    <score-button
      label="+"
      :value="formExecution.plus"
      @click="addMark({ fieldId: 'formExecution', value: 1 })"
    />

    <score-button color="none" label="" />
    <score-button color="none" label="" />
    <score-button
      label="&#10004;"
      :value="formExecution.check"
      @click="addMark({ fieldId: 'formExecution', value: 0 })"
    />

    <score-button
      label="Misses"
      :value="misses"
      color="red"
      @click="addMark({ fieldId: 'miss', value: 1 })"
    />
    <score-button color="none" label="" />
    <score-button
      label="-"
      :value="formExecution.minus"
      @click="addMark({ fieldId: 'formExecution', value: -1 })"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { mapMutations, useStore } from 'vuex'
import { RootState } from '../../../store'
import { Model } from '../../../models'

export default defineComponent({
  name: 'AthletePresentation',
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

    const formExecution = computed(() => {
        const marks = { plus: 0, check: 0, minus: 0 }

        for (const mark of store.state.scoresheet.currentScoresheet?.marks ?? []) {
          if (mark.fieldId === 'formExecution') {
            if (mark.value === 1) marks.plus += 1
            if (mark.value === 0) marks.check += 1
            if (mark.value === -1) marks.minus += 1
          }
        }

        return marks
      })

    return {
      formExecution,
      misses: computed(() => {
        return store.state.scoresheet.currentScoresheet?.marks.reduce(
          (acc, mark) => acc + (mark.fieldId === 'miss' ? mark.value : 0),
          0
        ) ?? 0
      }),
      result: computed(() => {
        const { plus, check, minus } = formExecution.value
        if (plus + check + minus === 0) return 1
        let average = (plus - minus) / (plus + check + minus)
        let percentage = average * (0.60 / 2);
        return Math.round((1 + percentage) * 100) / 100;
      })
    }
  },
  methods: {
    ...mapMutations(['addMark'])
  }
})
</script>
