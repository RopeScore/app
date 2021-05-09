<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="" />
    <div class="m-auto">Score: {{ result }}</div>
    <div class="m-auto text-center">Form/Execution</div>

    <score-button color="none" label="" />
    <score-button color="none" label="" />
    <score-button
      label="+"
      :value="tally('formExecutionPlus')"
      @click="addMark({ schema: 'formExecutionPlus' })"
    />

    <score-button color="none" label="" />
    <score-button color="none" label="" />
    <score-button
      label="&#10004;"
      :value="tally('formExecutionCheck')"
      @click="addMark({ schema: 'formExecutionCheck' })"
    />

    <score-button
      label="Misses"
      :value="tally('miss')"
      color="red"
      @click="addMark({ schema: 'miss' })"
    />
    <score-button color="none" label="" />
    <score-button
      label="-"
      :value="tally('formExecutionMinus')"
      @click="addMark({ schema: 'formExecutionMinus' })"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { mapActions, useStore } from 'vuex'
import type { RootState } from '../../../store'
import type { Model } from '../../../models'

export type schemas = `formExecution${'Plus' | 'Check' | 'Minus'}` | 'miss'

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

    return {
      tally: store.getters.tally,
      result: computed(() => {
        const {
          formExecutionPlus: plus = 0,
          formExecutionCheck: check = 0,
          formExecutionMinus: minus = 0
        } = store.getters.tally
        if (plus + check + minus === 0) return 1
        let average = (plus - minus) / (plus + check + minus)
        let percentage = average * (0.60 / 2);
        return Math.round((1 + percentage) * 100) / 100;
      })
    }
  },
  methods: {
    ...mapActions(['addMark'])
  }
})
</script>
