<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="" />
    <score-button color="none" :label="'Score: ' + result" />
    <score-button color="none" label="" />

    <score-button
      v-for="[schema, level] in levels"
      :key="schema"
      :color="level < 7 ? 'green' : 'indigo'"
      :label="`Level ${level}`"
      :value="tally(schema)"
      @click="addMark({ schema })"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { mapActions, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import type { RootState } from '../../../store'
import type { Model } from '../../../models'

export type schemas = `diffL${'0.5' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

export default defineComponent({
  name: 'Difficulty',
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

    function L (level: number): number {
      if (level === 0) return 0
      return Math.round(Math.pow(1.8, level) * 10) / 100
    }

    const levels = computed((): Array<[schemas, number]> => [
      ['diffL1', 1],
      ['diffL0.5', 0.5],
      ['diffL4', 4],

      ['diffL2', 2],
      ['diffL7', 7],
      ['diffL5', 5],

      ['diffL3', 3],
      ['diffL8', 8],
      ['diffL6', 6],
    ])

    return {
      tally: store.getters.tally,
      levels,
      result: computed(() => {
        let res = 0
        for (let [schema, level] of levels.value) {
          res += L(level) * store.getters.tally(schema)
        }
        return Math.round(res * 100) / 100
      })
    }
  },
  methods: {
    ...mapActions(['addMark'])
  }
})
</script>
