<template>
  <score-navigation
    :steps="model?.steps"
    :current-step="currentStep"
    @change:step="currentStep = $event"
    @undo="onUndo()"
    @clear="onClear()"
  />
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
    ref="compRef"
    :model="model"
    :step="currentStep"
  />
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useWakeLock, useEventListener } from '@vueuse/core'
import models from '../models'
import ScoreNavigation from '../components/ScoreNavigation.vue'
import BatteryStatus from '../components/BatteryStatus.vue'
import { useScoresheet } from '../hooks/scoresheet'

function preventDefault (event: TouchEvent) {
  event.preventDefault()
}

const route = useRoute()
const scsh = useScoresheet()
const wakeLock = useWakeLock()
const touchCleanup = ref<ReturnType<typeof useEventListener>>()

const currentStep = ref<string>()

onMounted(async () => {
  touchCleanup.value = useEventListener('touchmove', preventDefault, { passive: false })
  await wakeLock.request('screen')
  await scsh.open(route.params.system as string, ...route.params.vendor as string[])
})

onUnmounted(async () => {
  await scsh.close(false)
  await wakeLock.release()
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
    await scsh.close(false)
    await scsh.open(next.system as string, ...next.vendor as string[])
  }
})

const model = computed(() => {
  const sc = scsh.scoresheet.value
  if (!sc) return null
  const model = models.find(model => model.rulesId.includes(sc.rulesId) && (
    Array.isArray(model.judgeType) ? model.judgeType.includes(sc.judgeType) : model.judgeType === sc.judgeType
  ))
  if (!model) return null

  return model
})

watch(model, model => {
  if (model == null) return

  if (model.allowScroll) {
    touchCleanup.value?.()
  } else {
    touchCleanup.value = useEventListener('touchmove', preventDefault, { passive: false })
  }
})

useEventListener('beforeunload', event => {
  event.preventDefault()
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  event.returnValue = 'Do you really want to leave, the scoresheet will not be saved.'
})

onBeforeRouteLeave(() => {
  if (scsh.scoresheet.value) {
    const confirm = window.confirm('Do you really want to leave, the scoresheet will not be saved.')
    if (!confirm) return false
  }
})

watch(model, (newModel, oldModel) => {
  if (!Array.isArray(newModel?.steps) || newModel?.steps.length === 0) {
    currentStep.value = undefined
  } else {
    // newModel has steps!
    if (
      // if the old model didn't have steps
      !Array.isArray(oldModel?.steps) ||
      oldModel?.steps.length === 0 ||
      // or if the old model had different steps
      newModel?.steps.length !== oldModel?.steps.length ||
      newModel?.steps.some((step, idx) => oldModel?.steps?.indexOf(step) !== idx)
    ) {
      // we reset to the first step
      currentStep.value = newModel?.steps[0]
    }
  }
})

const compRef = ref()

async function onUndo () {
  compRef.value?.onUndo?.()
}

async function onClear () {
  compRef.value?.onClear?.()
}
</script>
