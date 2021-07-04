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
    :is="model?.component"
    :model="model"
  />
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref } from 'vue'
import { mapActions, mapMutations, useStore } from 'vuex'
import { RootState } from '../store'
import models from '../models'
import ScoreNavigation from '../components/ScoreNavigation.vue'
import { useRoute } from 'vue-router'
import { Scoresheet } from '../store/scoresheet'

function preventDefualt (event: TouchEvent) {
  event.preventDefault()
}

export default defineComponent({
  name: 'Score',
  components: {
    ScoreNavigation
  },
  setup () {
    const store = useStore<RootState>()
    const route = useRoute()
    const currentScoresheet = ref<Scoresheet | null>(null)

    store.dispatch('openScoresheet', route.params.id)
    watch(() => route.params, () => {
      console.log(route.params.id)
      route.params.id ? store.dispatch('openScoresheet', route.params.id) : true
    })

    watch(() => store.state.scoresheet.currentScoresheet, () => {
      currentScoresheet.value = store.state.scoresheet.currentScoresheet
    })

    return {
      currentScoresheet: currentScoresheet,
      model: computed(() => {
        const cs = currentScoresheet.value
        if (!cs) return null
        const model = models.find(model => model.rulesId.includes(cs.rulesId) && model.judgeType === cs.judgeType)
        if (!model) return null
        return model
      })
    }
  },
  methods: {
    ...mapActions([
      'openScoresheet',
      'saveCurrentScoresheet'
    ]),
    ...mapMutations([
      'setCurrentScoresheet'
    ])
  },
  mounted () {
    document.body.addEventListener('touchmove', preventDefualt, { passive: false })
    this.openScoresheet(this.$route.params.id)
  },
  async unmounted () {
    document.body.removeEventListener('touchmove', preventDefualt)
    await this.saveCurrentScoresheet(this.$route.params.id)
    this.setCurrentScoresheet(null)
  }
})
</script>
