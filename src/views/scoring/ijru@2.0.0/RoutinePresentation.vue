<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="Entertainment" />
    <score-button color="none" :label="'Score: ' + result" />
    <score-button color="none" label="Musicality" />

    <score-button
      label="+"
      :value="tally('entertainmentPlus')"
      @click="addMark({ schema: 'entertainmentPlus' })"
    />
    <score-button color="none" label="Ent Score" :value="entertainmentResult" />
    <score-button
      label="+"
      :value="tally('musicalityPlus')"
      @click="addMark({ schema: 'musicalityPlus' })"
    />

    <score-button
      label="&#10004;"
      :value="tally('entertainmentCheck')"
      @click="addMark({ schema: 'entertainmentCheck' })"
    />
    <score-button color="none" label="Musicality Score" :value="musicalityResult" />
    <score-button
      label="&#10004;"
      :value="tally('musicalityCheck')"
      @click="addMark({ schema: 'musicalityCheck' })"
    />

    <score-button
      label="-"
      :value="tally('entertainmentMinus')"
      @click="addMark({ schema: 'entertainmentMinus' })"
    />
    <score-button color="none" label="" />
    <score-button
      label="-"
      :value="tally('musicalityMinus')"
      @click="addMark({ schema: 'musicalityMinus'})"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { mapActions, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import type { Model } from '../../../models'
import type { RootState } from '../../../store'

export type schemas = `entertainment${'Plus' | 'Check' | 'Minus'}`
  | `musicality${'Plus' | 'Check' | 'Minus'}`

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

    const entertainmentResult = computed(() => {
      const plus = store.getters.tally('entertainmentPlus')
      const check = store.getters.tally('entertainmentCheck')
      const minus = store.getters.tally('entertainmentMinus')
      if (plus + check + minus === 0) return 1
      let average = (plus - minus) / (plus + check + minus)
      let percentage = average * (0.60 / 4);
      return Math.round((1 + percentage) * 100) / 100;
    })

    const musicalityResult = computed(() => {
      const plus = store.getters.tally('musicalityPlus')
      const check = store.getters.tally('musicalityCheck')
      const minus = store.getters.tally('musicalityMinus')
      if (plus + check + minus === 0) return 1
      let average = (plus - minus) / (plus + check + minus)
      let percentage = average * (0.60 / 4);
      return Math.round((1 + percentage) * 100) / 100;
    })

    return {
      tally: store.getters.tally,
      entertainmentResult,
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
    ...mapActions(['addMark'])
  }
})
</script>
