<template>
  <main class="grid grid-cols-3 grid-rows-score">
    <score-button color="none" label="" />
    <score-button color="none" :label="'Score: ' + result" />
    <score-button color="none" label="" />

    <score-button
      v-for="level in [1,.5,4,2,7,5,3,8,6]"
      :key="level"
      :color="level < 7 ? 'green' : 'indigo'"
      :label="`Level ${level}`"
      :value="levels[level.toString()] ?? 0"
      @click="addMark({ fieldId: `difficulty`, value: level })"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { mapMutations, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import { RootState } from '../../../store'
import { Model } from '../../../models'

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
    const levels = computed(() => {
      const marks: { [prop: string]: number } = {}
      for (const mark of store.state.scoresheet.currentScoresheet?.marks ?? []) {
        if (mark.fieldId !== 'difficulty') continue
        marks[mark.value.toString()] = (marks[mark.value.toString()] ?? 0) + 1
      }
      return marks
    })

    function L (level: number): number {
      if (level === 0) return 0
      return Math.round(Math.pow(1.8, level) * 10) / 100
    }

    return {
      levels,
      result: computed(() => {
        return (
          Math.round(
            (store.state.scoresheet.currentScoresheet?.marks ?? [])
              .filter(mark => mark.fieldId === 'difficulty')
              .map(mark => L(mark.value))
              .reduce((a, b) => a + b, 0) * 100
          ) / 100
        )
      })
    }
  },
  methods: {
    ...mapMutations(['addMark']),
    noop () {}
  }
})
</script>
