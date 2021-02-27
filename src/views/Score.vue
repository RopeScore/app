<template>
  <div v-if="!currentScoresheet">
    No active Scoresheet
  </div>
  <div v-else-if="!model">
    Unsupported Judge Type
  </div>
  <component v-else :is="model.component" :model="model" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { State } from '../store'
import models from '../models'

export default defineComponent({
  name: 'Score',
  setup () {
    const store = useStore<State>()

    return {
      currentScoresheet: computed(() => store.state.currentScoresheet),
      model: computed(() => {
        const cs = store.state.currentScoresheet
        if (!cs) return null
        const model = models.find(model => model.rulesId.includes(cs.rulesId) && model.judgeType === cs.judgeType)
        if (!model) return null
        return model
      })
    }
  }
})
</script>
