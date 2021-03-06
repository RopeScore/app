<template>
  <main class="grid grid-rows-score-alternative grid-cols-2">
    <template v-if="isHeadJudge">
      <score-button
        label="False Starts"
        color="red"
        :value="falseStarts"
        single-row
        @click="addMark({ fieldId: 'falseStart', value: 1 })"
        />
      <score-button
        v-if="isHeadJudge"
        label="False Switches"
        color="red"
        :value="falseSwitches"
        single-row
        @click="addMark({ fieldId: 'falseSwitch', value: 1 })"
      />
    </template>
    <template v-else>
      <score-button color="none" label="" />
      <score-button color="none" label="" />
    </template>

    <score-button
      label="Steps"
      :value="steps"
      class="col-span-2 row-span-3 mx-12"
      @click="addMark({ fieldId: 'speedStep', value: 1 })"
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
  name: 'Speed',
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
    const store = useStore<State>()

    return {
      steps: computed(() =>
        store.state.scoresheet.currentScoresheet?.marks.reduce(
          (acc, mark) => acc +
            (mark.fieldId === 'speedStep' ? mark.value : 0),
          0
        ) ?? 0
      ),
      falseStarts: computed(() =>
        store.state.scoresheet.currentScoresheet?.marks.reduce(
          (acc, mark) => acc +
            (mark.fieldId === 'falseStart' ? mark.value : 0),
          0
        ) ?? 0
      ),
      falseSwitches: computed(() =>
        store.state.scoresheet.currentScoresheet?.marks.reduce(
          (acc, mark) => acc +
            (mark.fieldId === 'falseSwitch' ? mark.value : 0),
          0
        ) ?? 0
      )
    }
  },
  computed: {
    isHeadJudge (): boolean {
      return this.model.judgeType === 'H'
    }
  },
  methods: {
    ...mapMutations(['addMark'])
  }
})
</script>

<style scoped>
.grid-rows-score-alternative {
  grid-template-rows: 9vh 81vh;
}
</style>
