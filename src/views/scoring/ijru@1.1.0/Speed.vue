<template>
  <main class="grid grid-rows-score grid-cols-2">
    <template v-if="isHeadJudge">
      <score-button
        label="False Starts"
        color="red"
        :value="tally('falseStart')"
        single-row
        @click="store.dispatch('addMark', { schema: 'falseStart' })"
        />
      <score-button
        v-if="isHeadJudge"
        label="False Switches"
        color="red"
        :value="tally('falseSwitch')"
        single-row
        @click="store.dispatch('addMark', { schema: 'falseSwitch' })"
      />
    </template>
    <template v-else>
      <score-button color="none" label="" />
      <score-button color="none" label="" />
    </template>

    <score-button
      label="Steps"
      :value="tally('step')"
      class="col-span-2 row-span-3 mx-12"
      @click="store.dispatch('addMark', { schema: 'step' })"
    />
  </main>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import { useStore } from 'vuex'
import ScoreButton from '../../../components/ScoreButton.vue'

import type { PropType } from 'vue'
import type { Model } from '../../../models'
import type { RootState } from '../../../store'

export type schemas = 'step' | 'falseStart' | 'falseSwitch'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const store = useStore<RootState>()
const tally = store.getters.tally

const isHeadJudge = computed(() => props.model.judgeType === 'Shj')
</script>
