<template>
  <score-navigation />

  <div v-if="!store.getters.currentScoresheet">
    No active Scoresheet
  </div>
  <div v-else-if="!model">
    Unsupported Judge Type
  </div>
  <component
    :is="model?.component"
    v-else
    :model="model"
  />
</template>

<script lang="ts" setup>
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import models from '../models'
import ScoreNavigation from '../components/ScoreNavigation.vue'

import type { RootState } from '../store'

function preventDefualt (event: TouchEvent) {
  event.preventDefault()
}

const store = useStore<RootState>()
const route = useRoute()
store.dispatch('openScoresheet', route.params.id)

onMounted(() => {
  document.body.addEventListener('touchmove', preventDefualt, { passive: false })
  store.dispatch('openScoresheet', route.params.id)
})

onUnmounted(async () => {
  document.body.removeEventListener('touchmove', preventDefualt)
  await store.dispatch('saveCurrentScoresheet', route.params.id)
  store.commit('setCurrentScoresheet', null)
})

watch(() => route.params, () => {
  console.log(route.params.id)
  if (route.params.id) store.dispatch('openScoresheet', route.params.id)
})

const model = computed(() => {
  const cs = store.getters.currentScoresheet
  if (!cs) return null
  const model = models.find(model => model.rulesId.includes(cs.rulesId) && model.judgeType === cs.judgeType)
  if (!model) return null
  return model
})

</script>
