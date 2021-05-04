<template>
  <main class="grid grid-rows-score-alternative grid-cols-2">
    <template v-if="isHeadJudge">
      <score-button
        label="False Starts"
        color="red"
        :value="tally.falseStart ?? 0"
        single-row
        @click="addMark({ schema: 'falseStart' })"
        />
      <score-button
        v-if="isHeadJudge"
        label="False Switches"
        color="red"
        :value="tally.falseSwitch ?? 0"
        single-row
        @click="addMark({ schema: 'falseSwitch' })"
      />
    </template>
    <template v-else>
      <score-button color="none" label="" />
      <score-button color="none" label="" />
    </template>

    <score-button
      label="Steps"
      :value="tally.step ?? 0"
      class="col-span-2 row-span-3 mx-12"
      @click="addMark({ schema: 'step' })"
    />
  </main>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'
import type { Model } from '../../../models'
import type { RootState } from '../../../store'

export type schemas = 'step' | 'falseStart' | 'falseSwitch'

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
    const store = useStore<RootState>()

    return {
      tally: store.getters.tally
    }
  },
  computed: {
    isHeadJudge (): boolean {
      return this.model.judgeType === 'H'
    }
  },
  methods: {
    ...mapActions(['addMark'])
  }
})
</script>

<style scoped>
.grid-rows-score-alternative {
  grid-template-rows: 9vh 81vh;
}
</style>
