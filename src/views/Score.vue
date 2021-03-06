<template>
  <score-navigation />

  <div v-if="!currentScoresheet">
    No active Scoresheet
  </div>
  <div v-else-if="!model">
    Unsupported Judge Type
  </div>
  <component
    v-else
    :is="model.component"
    :model="model"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { State } from '../store'
import models from '../models'
import ScoreNavigation from '../components/ScoreNavigation.vue'
import { useRoute } from 'vue-router'

function preventDefualt (event: TouchEvent) {
  event.preventDefault()
}

export default defineComponent({
  name: 'Score',
  components: {
    ScoreNavigation
  },
  setup () {
    const store = useStore<State>()
    const route = useRoute()

    store.dispatch('openScoresheet', route.params.id)

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
  },
  mounted () {
    document.body.addEventListener('touchmove', preventDefualt, { passive: false })
  },
  unmounted () {
    document.body.removeEventListener('touchmove', preventDefualt)
  }
})
</script>
