<template>
  <div>
    <score-navigation />

    <main class="grid grid-cols-3 grid-rows-score">
      <div></div>
      <div class="spacer m-auto">Score: {{ result }}</div>
      <div></div>

      <score-button
        v-for="level in [1,.5,4,2,7,5,3,8,6]"
        :key="level"
        :color="level < 7 ? 'green' : 'indigo'"
        :label="`Level ${level}`"
        :value="levels[level.toString()] ?? 0"
        @click="addMark({ fieldId: `difficulty`, value: level })"
      />
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { mapMutations, useStore } from 'vuex'
import ScoreNavigation from '../../../components/ScoreNavigation.vue'
import ScoreButton from '../../../components/ScoreButton.vue'
import { State } from '../../../store'

export default defineComponent({
  components: {
    ScoreButton,
    ScoreNavigation
  },
  name: 'Difficulty',
  data: () => ({
    result: 0
  }),
  setup () {
    const store = useStore<State>()

    return {
      levels: computed(() => {
        const marks: { [prop: string]: number } = {}
        for (const mark of store.state.currentScoresheet?.marks ?? []) {
          if (mark.fieldId !== 'difficulty') continue
          marks[mark.value.toString()] = (marks[mark.value.toString()] ?? 0) + 1
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
