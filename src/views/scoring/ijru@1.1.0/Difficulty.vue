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
import { State } from '../../../store'
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
  data: () => ({
    result: 0
  }),
  setup () {
    const store = useStore<State>()

    return {
      levels: computed(() => {
        const marks: { [prop: string]: number } = {}
        for (const mark of store.state.scoresheet.currentScoresheet?.marks ?? []) {
          if (mark.fieldId !== 'difficulty') continue
          marks[mark.value.toString()] = (marks[mark.value.toString()] ?? 0) + 1
        }
        return marks
      })
    }
  },
  methods: {
    ...mapMutations(['addMark']),
    noop () {}
  }
})
</script>
