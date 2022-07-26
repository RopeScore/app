<template>
  <score-navigation />
  <battery-status :hidden="true" />

  <div v-if="!scsh.scoresheet.value">
    No active Scoresheet
  </div>
  <div v-else-if="!model">
    Unsupported Judge Type
    {{ scsh.scoresheet.value }}
  </div>
  <component
    :is="model?.component"
    v-else
    :model="model"
  />
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWakeLock } from '@vueuse/core'
import models from '../models'
import ScoreNavigation from '../components/ScoreNavigation.vue'
import BatteryStatus from '../components/BatteryStatus.vue'
import { useScoresheet } from '../hooks/scoresheet'

function preventDefualt (event: TouchEvent) {
  event.preventDefault()
}

const route = useRoute()
const scsh = useScoresheet()
const wakeLock = useWakeLock()

onMounted(async () => {
  document.body.addEventListener('touchmove', preventDefualt, { passive: false })
  await wakeLock.request('screen')
  await scsh.open(route.params.system as string, ...route.params.vendor)
})

onUnmounted(async () => {
  await scsh.close()
  await wakeLock.release()
  document.body.removeEventListener('touchmove', preventDefualt)
})

watch(() => route.params, async (next, prev) => {
  if (next.system === prev.system &&
    (Array.isArray(next.vendor)
      ? next.vendor.every((p, idx) => p === prev.vendor[idx])
      : next.vendor === prev.vendor)
  ) {
    console.log('the specified scoresheet is already open')
    return
  }
  if (next.system && next.vendor) {
    await scsh.close()
    await scsh.open(next.system as string, ...next.vendor)
  }
})

const model = computed(() => {
  const sc = scsh.scoresheet.value
  if (!sc) return null
  const model = models.find(model => model.rulesId.includes(sc.rulesId) && model.judgeType === sc.judgeType)
  if (!model) return null

  if (model.allowScroll) {
    document.body.removeEventListener('touchmove', preventDefualt)
  } else {
    document.body.addEventListener('touchmove', preventDefualt, { passive: false })
  }

  return model
})
</script>
